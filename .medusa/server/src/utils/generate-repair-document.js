"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRepairDocument = generateRepairDocument;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pdfkit_1 = __importDefault(require("pdfkit"));
const pdf_lib_1 = require("pdf-lib");
const qrcode_1 = __importDefault(require("qrcode"));
const repair_1 = require("../modules/repair");
const zoho_books_js_1 = require("../services/zoho-books.js");
// Helpers
const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};
const postProcessZohoPdf = async (pdfBuffer, ticket, docType) => {
    try {
        const pdfDoc = await pdf_lib_1.PDFDocument.load(pdfBuffer);
        // 1. Generate & Embed QR Code Safely
        let qrImage = null;
        try {
            const qrUrl = `${process.env.STORE_URL || "http://localhost:3000"}/store/repairs/track?number=${ticket.ticket_number}`;
            const qrBufferLib = await qrcode_1.default.toBuffer(qrUrl, {
                errorCorrectionLevel: "H",
                type: "png",
                margin: 1,
                width: 70,
            });
            qrImage = await pdfDoc.embedPng(qrBufferLib);
        }
        catch (qrErr) {
            console.error("[postProcessZohoPdf] QR Code generation skipped due to error:", qrErr);
        }
        // 2. Determine Watermark
        let watermarkText = "";
        let watermarkColor = (0, pdf_lib_1.rgb)(0.8, 0.8, 0.8);
        const isPaid = ticket.payment_status === "captured" || ticket.payment_status === "paid" || docType === "receipt";
        if (docType === "invoice" || docType === "receipt") {
            watermarkText = isPaid ? "PAID" : "UNPAID";
            watermarkColor = isPaid ? (0, pdf_lib_1.rgb)(0.13, 0.77, 0.36) : (0, pdf_lib_1.rgb)(0.93, 0.26, 0.26); // green vs red
        }
        else if (docType === "quote") {
            watermarkText = "QUOTATION";
            watermarkColor = (0, pdf_lib_1.rgb)(0.8, 0.8, 0.8);
        }
        // Override if cancelled
        if (ticket.status === "cancelled") {
            watermarkText = "CANCELLED";
            watermarkColor = (0, pdf_lib_1.rgb)(0.93, 0.26, 0.26);
        }
        const helveticaFont = await pdfDoc.embedFont(pdf_lib_1.StandardFonts.HelveticaBold);
        const pages = pdfDoc.getPages();
        if (pages.length > 0) {
            const firstPage = pages[0];
            // Draw QR Code
            if (qrImage) {
                firstPage.drawImage(qrImage, {
                    x: firstPage.getWidth() - 110,
                    y: 40,
                    width: 70,
                    height: 70,
                });
            }
            // Draw Watermark
            if (watermarkText) {
                firstPage.drawText(watermarkText, {
                    x: firstPage.getWidth() / 2 - 120,
                    y: firstPage.getHeight() / 2 - 120,
                    size: 80,
                    font: helveticaFont,
                    color: watermarkColor,
                    opacity: 0.15,
                    rotate: (0, pdf_lib_1.degrees)(45),
                });
            }
        }
        // Obscure "Powered by Zoho Books" at the bottom of all pages
        for (const page of pages) {
            page.drawRectangle({
                x: 0,
                y: 0,
                width: page.getWidth(),
                height: 35,
                color: (0, pdf_lib_1.rgb)(1, 1, 1),
            });
        }
        const modifiedPdfBytes = await pdfDoc.save();
        return Buffer.from(modifiedPdfBytes);
    }
    catch (e) {
        console.error("[postProcessZohoPdf] CRITICAL Error processing PDF:", e?.message || e);
        return pdfBuffer; // fallback to original
    }
};
const formatDate = (dateString) => {
    if (!dateString)
        return "";
    const d = new Date(dateString);
    return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
};
async function generateRepairDocument(docType, ticket, customerName, res, req) {
    const repairService = req.scope.resolve(repair_1.REPAIR_MODULE);
    const [settings] = await repairService.listRepairSettings({});
    let zohoError = "";
    if (!settings?.zoho_books_enabled) {
        zohoError = "Zoho Books Integration is disabled in Admin settings.";
    }
    else if (!settings.zoho_client_id || !settings.zoho_client_secret || !settings.zoho_refresh_token || !settings.zoho_organization_id) {
        zohoError = "Zoho Books enabled but missing API credentials.";
    }
    else {
        const logger = req.scope.resolve("logger");
        const zoho = new zoho_books_js_1.ZohoBooksService({
            client_id: settings.zoho_client_id,
            client_secret: settings.zoho_client_secret,
            refresh_token: settings.zoho_refresh_token,
            organization_id: settings.zoho_organization_id,
            domain: settings.zoho_domain || "com",
        }, logger);
        try {
            // 1. Sync Contact
            let customerObj = { email: `guest-${ticket.id}@example.com`, first_name: customerName };
            if (ticket.customer_id) {
                const customerModule = req.scope.resolve("customer", { allowUnregistered: true });
                if (customerModule) {
                    const c = await customerModule.retrieveCustomer(ticket.customer_id);
                    if (c)
                        customerObj = c;
                }
            }
            const contactId = await zoho.syncContact(customerObj);
            // 2. Generate Estimate or Invoice or Receipt
            const metadata = ticket.metadata || {};
            if (docType === "quote") {
                let estId = metadata.zoho_estimate_id;
                if (!estId) {
                    estId = await zoho.createEstimate(contactId, ticket);
                    await repairService.updateRepairTickets({ id: ticket.id, metadata: { ...metadata, zoho_estimate_id: estId } });
                }
                const pdfBuffer = await zoho.getDocumentPdf(estId, "estimate");
                const modifiedBuffer = await postProcessZohoPdf(Buffer.from(pdfBuffer), ticket, docType);
                res.setHeader("Content-Type", "application/pdf");
                res.setHeader("Content-Disposition", `inline; filename="Repair-Quote-${ticket.ticket_number}.pdf"`);
                return res.send(modifiedBuffer);
            }
            else if (docType === "receipt" && metadata.zoho_payment_id) {
                const pdfBuffer = await zoho.getPaymentReceiptPdf(metadata.zoho_payment_id);
                const modifiedBuffer = await postProcessZohoPdf(Buffer.from(pdfBuffer), ticket, docType);
                res.setHeader("Content-Type", "application/pdf");
                res.setHeader("Content-Disposition", `inline; filename="Repair-Receipt-${ticket.ticket_number}.pdf"`);
                return res.send(modifiedBuffer);
            }
            else if (docType === "invoice") {
                let invId = metadata.zoho_invoice_id;
                if (!invId) {
                    invId = await zoho.createInvoice(contactId, ticket);
                    await repairService.updateRepairTickets({ id: ticket.id, metadata: { ...metadata, zoho_invoice_id: invId } });
                }
                const pdfBuffer = await zoho.getDocumentPdf(invId, "invoice");
                const modifiedBuffer = await postProcessZohoPdf(Buffer.from(pdfBuffer), ticket, docType);
                res.setHeader("Content-Type", "application/pdf");
                res.setHeader("Content-Disposition", `inline; filename="Repair-Invoice-${ticket.ticket_number}.pdf"`);
                return res.send(modifiedBuffer);
            }
            // If docType is "job_card" or anything else, it bypasses Zoho and generates locally using PDFKit
        }
        catch (e) {
            zohoError = `Zoho Error: ${e.message}`;
            logger.error(`Zoho Books Integration failed: ${e.message}. Falling back to local PDF generation.`);
        }
    }
    const parseNum = (val) => {
        if (!val)
            return 0;
        if (typeof val === "object" && "value" in val)
            return Number(val.value);
        return Number(val);
    };
    const tTotal = parseNum(ticket.total_estimate);
    const tActual = parseNum(ticket.total_actual);
    const finalTotal = ticket.status === "completed" && tActual > 0 ? tActual : tTotal;
    // Generate QR code
    const qrUrl = `${process.env.STORE_URL || "http://localhost:3000"}/store/repairs/track?number=${ticket.ticket_number}`;
    let qrBuffer = null;
    try {
        qrBuffer = await qrcode_1.default.toBuffer(qrUrl, {
            errorCorrectionLevel: "H",
            type: "png",
            margin: 1,
            width: 60,
        });
    }
    catch (e) { }
    const doc = new pdfkit_1.default({ margin: 50, size: "A4" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${ticket.ticket_number}-${docType}.pdf"`);
    doc.pipe(res);
    // 1. Logo
    try {
        if (settings?.pdf_logo_url) {
            const response = await fetch(settings.pdf_logo_url);
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            doc.image(buffer, 50, 40, { width: 140 });
        }
        else {
            const logoPath = path_1.default.resolve(process.cwd(), "src/utils/assets/logo.png");
            if (fs_1.default.existsSync(logoPath)) {
                doc.image(logoPath, 50, 40, { width: 140 });
            }
            else {
                doc.fontSize(24).font("Helvetica-Bold").fillColor("#333").text(settings?.company_name || "URBAN DEVICE CARE", 50, 50);
            }
        }
    }
    catch (e) {
        doc.fontSize(24).font("Helvetica-Bold").fillColor("#333").text(settings?.company_name || "URBAN DEVICE CARE", 50, 50);
    }
    // 2. Document Title & Number
    let title = "INVOICE";
    let prefix = "INV";
    if (docType === "job_card") {
        title = "JOB CARD";
        prefix = "JOB";
    }
    else if (docType === "receipt") {
        title = "RECEIPT";
        prefix = "REC";
    }
    else if (docType === "quote") {
        title = "QUOTATION";
        prefix = "QUO";
    }
    doc.fontSize(26).font("Helvetica").fillColor("#000").text(title, 350, 50, { align: "right" });
    // Format doc number as RT-ticketnumber
    const docNumber = `RT-${ticket.ticket_number}`;
    doc.fontSize(10).font("Helvetica-Bold").text(docNumber, 350, 80, { align: "right" });
    if (docType === "invoice") {
        const isPaid = ticket.payment_status === "captured" || ticket.payment_status === "paid" || ticket.status === "completed";
        const statusText = isPaid ? "PAID" : "UNPAID";
        const statusColor = isPaid ? "#008000" : "#CC0000";
        doc.fontSize(10).font("Helvetica-Bold").fillColor(statusColor).text(statusText, 350, 95, { align: "right" });
    }
    // 3. Balance Due
    let balanceDue = 0;
    let paymentMade = 0;
    if (docType === "invoice") {
        paymentMade = parseNum(ticket.deposit) || 0;
        balanceDue = finalTotal - paymentMade;
    }
    else if (docType === "receipt") {
        paymentMade = finalTotal;
        balanceDue = 0;
    }
    if (docType === "invoice" || docType === "receipt") {
        doc.fontSize(10).font("Helvetica").text("Balance Due", 350, 110, { align: "right" });
        doc.fontSize(12).font("Helvetica-Bold").text(`KES${formatCurrency(balanceDue)}`, 350, 125, { align: "right" });
    }
    // Company Info
    doc.fontSize(10).font("Helvetica-Bold").fillColor("#000").text("Urban Device Care Ltd", 50, 130);
    doc.font("Helvetica").fontSize(9).fillColor("#333");
    doc.text("Bekim house,", 50, 145);
    doc.text("Westlands crossway Road");
    doc.text("00800, Nairobi");
    doc.text("Kenya");
    doc.text("0729436660 / 0794700241");
    doc.text("urbandevice.care@gmail.com");
    // QR Code positioned near company info
    if (qrBuffer) {
        doc.image(qrBuffer, 220, 130, { width: 60 });
    }
    // Dates and Meta
    const metaY = 250;
    const addMetaRow = (label, value, yPos) => {
        doc.font("Helvetica").fillColor("#333").text(label, 300, yPos, { width: 100, align: "right" });
        doc.text(value, 420, yPos, { width: 120, align: "right" });
    };
    let rowY = metaY;
    if (docType === "quote") {
        addMetaRow("Quote Date :", formatDate(ticket.created_at || new Date()), rowY);
        rowY += 15;
        const validUntil = new Date(ticket.created_at || new Date());
        validUntil.setDate(validUntil.getDate() + 14);
        addMetaRow("Valid Until :", formatDate(validUntil), rowY);
        rowY += 15;
    }
    else if (docType === "job_card") {
        addMetaRow("Intake Date :", formatDate(ticket.created_at || new Date()), rowY);
        rowY += 15;
        addMetaRow("Status :", String(ticket.status || "Unknown").toUpperCase(), rowY);
        rowY += 15;
    }
    else if (docType === "receipt") {
        addMetaRow("Payment Date :", formatDate(new Date()), rowY);
        rowY += 15;
    }
    else {
        addMetaRow("Invoice Date :", formatDate(ticket.created_at || new Date()), rowY);
        rowY += 15;
        addMetaRow("Terms :", "Due on Receipt", rowY);
        rowY += 15;
        addMetaRow("Due Date :", formatDate(ticket.created_at || new Date()), rowY);
        rowY += 15;
    }
    // Bill To / Customer Data
    doc.font("Helvetica-Bold").fontSize(10).fillColor("#000").text(customerName || "Customer", 50, metaY + 30);
    doc.font("Helvetica").fontSize(9).fillColor("#333");
    if (ticket.device) {
        doc.text(`Device: ${ticket.device.brand || ""} ${ticket.device.model_name || ""}`.trim());
        doc.text(`S/N: ${ticket.device.serial_number || "N/A"}`);
    }
    if (docType === "job_card") {
        doc.text(`Reported Issue: ${ticket.issue_description || "No description provided."}`);
    }
    // Table
    const tableTop = 320;
    doc.rect(50, tableTop, 495, 20).fill("#444444");
    doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(9);
    doc.text("#", 60, tableTop + 6);
    doc.text("Description", 90, tableTop + 6);
    if (docType === "job_card") {
        doc.text("Qty", 460, tableTop + 6, { width: 30, align: "center" });
    }
    else {
        doc.text("Qty", 350, tableTop + 6, { width: 30, align: "center" });
        doc.text("Rate", 390, tableTop + 6, { width: 60, align: "right" });
        doc.text("Amount", 460, tableTop + 6, { width: 75, align: "right" });
    }
    let currentY = tableTop + 30;
    doc.fillColor("#333333").font("Helvetica").fontSize(9);
    let i = 1;
    const drawRow = (desc, qty, rate, amt) => {
        // Ensure we don't bleed off the page, if we do we'd normally add a new page
        if (currentY > 650) {
            doc.addPage();
            currentY = 50;
        }
        doc.text(i.toString(), 60, currentY);
        if (docType === "job_card") {
            doc.text(desc, 90, currentY, { width: 350 });
            doc.text(qty.toFixed(2), 460, currentY, { width: 30, align: "center" });
        }
        else {
            doc.text(desc, 90, currentY, { width: 250 });
            doc.text(qty.toFixed(2), 350, currentY, { width: 30, align: "center" });
            doc.text(formatCurrency(rate), 390, currentY, { width: 60, align: "right" });
            doc.text(formatCurrency(amt), 460, currentY, { width: 75, align: "right" });
        }
        const height = doc.heightOfString(desc, { width: docType === "job_card" ? 350 : 250 }) || 10;
        currentY += height + 10;
        doc.moveTo(50, currentY - 5).lineTo(545, currentY - 5).lineWidth(0.5).strokeColor("#EEEEEE").stroke();
        i++;
    };
    if (ticket.parts && Array.isArray(ticket.parts)) {
        for (const p of ticket.parts) {
            const price = parseNum(p.prices?.[0]?.amount);
            drawRow(`${p.title} (SKU: ${p.sku || "N/A"})`, 1, price, price);
        }
    }
    if (ticket.custom_parts && Array.isArray(ticket.custom_parts)) {
        for (const cp of ticket.custom_parts) {
            const price = parseNum(cp.price);
            drawRow(cp.name, 1, price, price);
        }
    }
    const labor = parseNum(ticket.labor_estimate);
    if (labor > 0) {
        drawRow("Labor & Service Fee", 1, labor, labor);
    }
    if (i === 1) {
        doc.text("No cost items added yet.", 90, currentY);
        currentY += 20;
        doc.moveTo(50, currentY - 5).lineTo(545, currentY - 5).lineWidth(0.5).strokeColor("#EEEEEE").stroke();
    }
    currentY += 10;
    const summaryX = 350;
    const addSummaryRow = (label, value, yPos, isBold = false, valColor = "#333", bg = false) => {
        if (bg) {
            doc.rect(250, yPos - 5, 295, 20).fill("#F4F4F4");
        }
        doc.font(isBold ? "Helvetica-Bold" : "Helvetica").fillColor("#333").fontSize(9);
        doc.text(label, summaryX, yPos, { width: 80, align: "right" });
        doc.fillColor(valColor).font(isBold ? "Helvetica-Bold" : "Helvetica").text(value, summaryX + 90, yPos, { width: 95, align: "right" });
    };
    if (docType !== "job_card") {
        addSummaryRow("Sub Total", formatCurrency(finalTotal), currentY);
        currentY += 20;
        doc.moveTo(300, currentY - 10).lineTo(545, currentY - 10).lineWidth(0.5).strokeColor("#DDDDDD").stroke();
        addSummaryRow("Total", `KES${formatCurrency(finalTotal)}`, currentY, true);
        currentY += 20;
        if (docType === "invoice" || docType === "receipt") {
            addSummaryRow("Payment Made", `(-) ${formatCurrency(paymentMade)}`, currentY, false, "#C00000");
            currentY += 20;
            addSummaryRow("Balance Due", `KES${formatCurrency(balanceDue)}`, currentY, true, "#000", true);
            currentY += 20;
        }
    }
    // Signatures for job card
    if (docType === "job_card") {
        currentY += 50;
        if (currentY > 650) {
            doc.addPage();
            currentY = 50;
        }
        doc.moveTo(50, currentY).lineTo(250, currentY).strokeColor("#000000").stroke();
        doc.fontSize(10).font("Helvetica").text("Technician Signature", 50, currentY + 5);
        doc.moveTo(350, currentY).lineTo(545, currentY).stroke();
        doc.text("Customer Signature", 350, currentY + 5);
    }
    // Terms and conditions
    if (settings?.pdf_terms) {
        currentY += 40;
        if (currentY > 650) {
            doc.addPage();
            currentY = 50;
        }
        doc.fontSize(9).font("Helvetica-Bold").fillColor("#333").text("Terms & Conditions", 50, currentY);
        doc.fontSize(8).font("Helvetica").fillColor("#666").text(settings.pdf_terms, 50, currentY + 15, { width: 495 });
    }
    const pageHeight = doc.page.height;
    const footerY = pageHeight - 90;
    doc.fontSize(9).font("Helvetica-Bold").fillColor("#333");
    if (settings?.pdf_payment_details) {
        doc.text(settings.pdf_payment_details.replace(/\n/g, ' | '), 50, footerY, { width: 495 });
    }
    else {
        doc.text("Thanks for your business. | Paybill: 880100 - Acc No: PAYURBANDEVICE", 50, footerY);
    }
    if (zohoError) {
        doc.fontSize(8).fillColor("red").text(zohoError, 50, footerY + 15, { lineBreak: false });
    }
    doc.moveTo(50, footerY + 30).lineTo(545, footerY + 30).lineWidth(0.5).strokeColor("#CCCCCC").stroke();
    doc.fontSize(8).font("Helvetica").fillColor("#999").text(`POWERED BY ${settings?.company_name?.toUpperCase() || "URBAN DEVICE CARE"}`, 50, footerY + 40, { lineBreak: false });
    doc.text("1", 530, footerY + 40, { align: "right", lineBreak: false });
    let localWatermarkText = "";
    let localWatermarkColor = "#cccccc";
    const localIsPaid = ticket.payment_status === "captured" || ticket.payment_status === "paid" || docType === "receipt";
    if (docType === "invoice" || docType === "receipt") {
        localWatermarkText = localIsPaid ? "PAID" : "UNPAID";
        localWatermarkColor = localIsPaid ? "#22c55e" : "#ef4444";
    }
    else if (docType === "quote") {
        localWatermarkText = "QUOTATION";
        localWatermarkColor = "#cccccc";
    }
    if (ticket.status === "cancelled") {
        localWatermarkText = "CANCELLED";
        localWatermarkColor = "#ef4444";
    }
    if (localWatermarkText) {
        doc.save()
            .translate(doc.page.width / 2, doc.page.height / 2)
            .rotate(-45, { origin: [0, 0] })
            .fontSize(100)
            .fillColor(localWatermarkColor)
            .fillOpacity(0.15)
            .text(localWatermarkText, -250, -50, { align: "center", width: 500 })
            .restore();
    }
    doc.end();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGUtcmVwYWlyLWRvY3VtZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3V0aWxzL2dlbmVyYXRlLXJlcGFpci1kb2N1bWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQStHQSx3REFpWEM7QUFoZUQsNENBQW9CO0FBQ3BCLGdEQUF3QjtBQUV4QixvREFBaUM7QUFDakMscUNBQWdGO0FBQ2hGLG9EQUE0QjtBQUM1Qiw4Q0FBa0Q7QUFFbEQsNkRBQTZEO0FBRTdELFVBQVU7QUFDVixNQUFNLGNBQWMsR0FBRyxDQUFDLE1BQWMsRUFBRSxFQUFFO0lBQ3hDLE9BQU8sSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRTtRQUNwQyxxQkFBcUIsRUFBRSxDQUFDO1FBQ3hCLHFCQUFxQixFQUFFLENBQUM7S0FDekIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNwQixDQUFDLENBQUM7QUFFRixNQUFNLGtCQUFrQixHQUFHLEtBQUssRUFBRSxTQUFpQixFQUFFLE1BQVcsRUFBRSxPQUFlLEVBQW1CLEVBQUU7SUFDcEcsSUFBSSxDQUFDO1FBQ0gsTUFBTSxNQUFNLEdBQUcsTUFBTSxxQkFBUyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUUvQyxxQ0FBcUM7UUFDckMsSUFBSSxPQUFPLEdBQVEsSUFBSSxDQUFDO1FBQ3hCLElBQUksQ0FBQztZQUNILE1BQU0sS0FBSyxHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLElBQUksdUJBQXVCLCtCQUErQixNQUFNLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDdkgsTUFBTSxXQUFXLEdBQUcsTUFBTSxnQkFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUU7Z0JBQy9DLG9CQUFvQixFQUFFLEdBQUc7Z0JBQ3pCLElBQUksRUFBRSxLQUFLO2dCQUNYLE1BQU0sRUFBRSxDQUFDO2dCQUNULEtBQUssRUFB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LENBQUM7UUFDL0IsVUFBVSxDQUFDLGdCQUFnQixFQUFFLFVBQVUsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFBQyxJQUFJLElBQUksRUFBRSxDQUFDO0lBQzNFLENBQUM7U0FBTSxDQUFDO1FBQ0osVUFBVSxDQUFDLGdCQUFnQixFQUFFLFVBQVUsQ0FBQyxNQUFNLENBQUMsVUFBVSxJQUFJLElBQUksSUFBSSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUFDLElBQUksSUFBSSxFQUFFLENBQUM7UUFDNUYsVUFBVSxDQUFDLFNBQVMsRUFBRSxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUFDLElBQUksSUFBSSxFQUFFLENBQUM7UUFDMUQsVUFBVSxDQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsTUFBTSxDQUFDLFVBQVUsSUFBSSxJQUFJLElBQUksRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFBQyxJQUFJLElBQUksRUFBRSxDQUFDO0lBQzVGLENBQUM7SUFFRCwwQkFBMEI7SUFDMUIsR0FBRyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksSUFBSSxVQUFVLEVBQUUsRUFBRSxFQUFFLEtBQUssR0FBRyxFQUFFLENBQUMsQ0FBQztJQUMzRyxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDcEQsSUFBSSxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDaEIsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxJQUFJLEVBQUUsSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLFVBQVUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQzFG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QVEsRUFBRSxDQUFDLENBQUM7UUFDNUUsQ0FBQzthQUFNLENBQUM7WUFDSixHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFDN0MsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBQ3hFLEdBQUcsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBQzdFLEdBQUcsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQ2hGLENBQUM7UUFFRCxNQUFNLE1BQU0sR0FBRyxHQUFHLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxFQUFFLEtBQUssRUFBRSxPQUFPLEtBQUssVUFBVSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQzdGLFFBQVEsSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBRXhCLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBRXRHLENBQUMsRUFBRSxDQUFD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