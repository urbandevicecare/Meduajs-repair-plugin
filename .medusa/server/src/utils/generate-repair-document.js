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
        const logoPath = path_1.default.resolve(process.cwd(), "src/utils/assets/logo.png");
        if (fs_1.default.existsSync(logoPath)) {
            doc.image(logoPath, 50, 40, { width: 140 });
        }
        else {
            doc.fontSize(28).font("Helvetica-Bold").fillColor("#333").text("URBAN", 50, 50, { continued: true }).fillColor("#666").text(" DEVICE CARE");
            doc.fontSize(10).fillColor("#999").text("SINCE 2025", 50, 80);
        }
    }
    catch (e) {
        doc.fontSize(28).font("Helvetica-Bold").fillColor("#333").text("URBAN", 50, 50, { continued: true }).fillColor("#666").text(" DEVICE CARE");
        doc.fontSize(10).fillColor("#999").text("SINCE 2025", 50, 80);
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
    const pageHeight = doc.page.height;
    const footerY = pageHeight - 120; // 720
    doc.fontSize(9).font("Helvetica").fillColor("#333");
    doc.text("Thanks for your business.", 50, footerY, { lineBreak: false });
    doc.text("Paybill: 880100 - Acc No: PAYURBANDEVICE", 50, footerY + 15, { lineBreak: false });
    if (zohoError) {
        doc.fontSize(8).fillColor("red").text(zohoError, 50, footerY + 30, { lineBreak: false });
    }
    doc.moveTo(50, footerY + 45).lineTo(545, footerY + 45).lineWidth(0.5).strokeColor("#CCCCCC").stroke();
    doc.fontSize(8).fillColor("#999").text("POWERED BY URBAN DEVICE CARE", 50, footerY + 55, { lineBreak: false });
    doc.text("1", 530, footerY + 55, { align: "right", lineBreak: false });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGUtcmVwYWlyLWRvY3VtZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3V0aWxzL2dlbmVyYXRlLXJlcGFpci1kb2N1bWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQStHQSx3REFpV0M7QUFoZEQsNENBQW9CO0FBQ3BCLGdEQUF3QjtBQUV4QixvREFBaUM7QUFDakMscUNBQWdGO0FBQ2hGLG9EQUE0QjtBQUM1Qiw4Q0FBa0Q7QUFFbEQsNkRBQTZEO0FBRTdELFVBQVU7QUFDVixNQUFNLGNBQWMsR0FBRyxDQUFDLE1BQWMsRUFBRSxFQUFFO0lBQ3hDLE9BQU8sSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRTtRQUNwQyxxQkFBcUIsRUFBRSxDQUFDO1FBQ3hCLHFCQUFxQixFQUFFLENBQUM7S0FDekIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNwQixDQUFDLENBQUM7QUFFRixNQUFNLGtCQUFrQixHQUFHLEtBQUssRUFBRSxTQUFpQixFQUFFLE1BQVcsRUFBRSxPQUFlLEVBQW1CLEVBQUU7SUFDcEcsSUFBSSxDQUFDO1FBQ0gsTUFBTSxNQUFNLEdBQUcsTUFBTSxxQkFBUyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUUvQyxxQ0FBcUM7UUFDckMsSUFBSSxPQUFPLEdBQVEsSUFBSSxDQUFDO1FBQ3hCLElBQUksQ0FBQztZQUNILE1BQU0sS0FBSyxHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLElBQUksdUJBQXVCLCtCQUErQixNQUFNLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDdkgsTUFBTSxXQUFXLEdBQUcsTUFBTSxnQkFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUU7Z0JBQy9DLG9CQUFvQixFQUFFLEdBQUc7Z0JBQ3pCLElBQUksRUFBRSxLQUFLO2dCQUNYLE1BQU0sRUFBRSxDQUFDO2dCQUNULEtBQUssRUFB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RUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQy9GLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO0lBQy9ELENBQUMsQ0FBQztJQUVGLElBQUksSUFBSSxHQUFHLEtBQUssQ0FBQztJQUNqQixJQUFJLE9BQU8sS0FBSyxPQUFPLEVBQUUsQ0FBQztRQUN0QixVQUFVLENBQUMsY0FBYyxFQUFFLFVBQVUsQ0FBQyxNQUFNLENBQUMsVUFBVSxJQUFJLElBQUksSUFBSSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUFDLElBQUksSUFBSSxFQUFFLENBQUM7UUFDMUYsTUFBTSxVQUFVLEdBQUcsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsSUFBSSxJQUFJLElBQUksRUFBRSxDQUFDLENBQUM7UUFDN0QsVUFBVSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDOUMsVUFBVSxDQUFDLGVBQWUsRUFBRSxVQUFVLENBQUMsVUFBVSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFBQyxJQUFJLElBQUksRUFBRSxDQUFDO0lBQzFFLENBQUM7U0FBTSxJQUFJLE9BQU8sS0FBSyxVQUFVLEVBQUUsQ0FBQztRQUNoQyxVQUFVLENBQUMsZUFBZSxFQUFFLFVBQVUsQ0FBQyxNQUFNLENBQUMsVUFBVSxJQUFJLElBQUksSUFBSSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUFDLElBQUksSUFBSSxFQUFFLENBQUM7UUFDM0YsVUFBVSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sSUFBSSxTQUFTLENBQUMsQ0FBQyxXQUFXLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUFDLElBQUksSUFBSSxFQUFFLENBQUM7SUFDL0YsQ0FBQztTQUFNLElBQUksT0FBTyxLQUFL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QUssRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQzVFLENBQUM7YUFBTSxDQUFDO1lBQ0osR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1lBQzdDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUN4RSxHQUFHLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztZQUM3RSxHQUFHLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUNoRixDQUFDO1FBRUQsTUFBTSxNQUFNLEdBQUcsR0FBRyxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxLQUFLLEVBQUUsT0FBTyxLQUFLLFVBQVUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUM3RixRQUFRLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztRQUV4QixHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUV0RyxDQUFD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