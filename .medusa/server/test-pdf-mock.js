"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const pdf_lib_1 = require("pdf-lib");
const qrcode_1 = __importDefault(require("qrcode"));
// Extracted from src/utils/generate-repair-document.ts
const postProcessZohoPdf = async (pdfBuffer, ticket, docType) => {
    try {
        const pdfDoc = await pdf_lib_1.PDFDocument.load(pdfBuffer);
        // 1. Generate & Embed QR Code Safely
        let qrImage = null;
        try {
            const qrUrl = `http://localhost:3000/store/repairs/track?number=${ticket.ticket_number}`;
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
        return pdfBuffer;
    }
};
async function runTest() {
    console.log("Creating dummy Zoho PDF...");
    const pdfDoc = await pdf_lib_1.PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size
    // Draw some dummy content
    const font = await pdfDoc.embedFont(pdf_lib_1.StandardFonts.Helvetica);
    page.drawText("Zoho Dummy Invoice", { x: 50, y: 800, size: 24, font });
    page.drawText("Total: 10,000 KES", { x: 50, y: 750, size: 14, font });
    // Draw "Powered by Zoho Books" near the bottom to test masking
    page.drawText("Powered by Zoho Books", { x: 50, y: 15, size: 10, font, color: (0, pdf_lib_1.rgb)(0, 0, 1) });
    const dummyPdfBuffer = Buffer.from(await pdfDoc.save());
    console.log("Running postProcessZohoPdf for an UNPAID INVOICE...");
    const unpaidTicket = { ticket_number: "RT-12345", payment_status: "pending", status: "ready" };
    const resultPdf = await postProcessZohoPdf(dummyPdfBuffer, unpaidTicket, "invoice");
    fs_1.default.writeFileSync("/Users/slyb./.gemini/antigravity/brain/7a6c803e-eeb8-42ce-a2f7-ed0ebbc23527/.user_uploaded/mock-unpaid.pdf", resultPdf);
    console.log("Saved mock-unpaid.pdf to artifacts.");
    console.log("Running postProcessZohoPdf for a PAID INVOICE...");
    const paidTicket = { ticket_number: "RT-12345", payment_status: "captured", status: "completed" };
    const paidResultPdf = await postProcessZohoPdf(dummyPdfBuffer, paidTicket, "invoice");
    fs_1.default.writeFileSync("/Users/slyb./.gemini/antigravity/brain/7a6c803e-eeb8-42ce-a2f7-ed0ebbc23527/.user_uploaded/mock-paid.pdf", paidResultPdf);
    console.log("Saved mock-paid.pdf to artifacts.");
}
runTest().catch(console.error);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC1wZGYtbW9jay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3Rlc3QtcGRmLW1vY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSw0Q0FBb0I7QUFDcEIscUNBQWdGO0FBQ2hGLG9EQUE0QjtBQUU1Qix1REFBdUQ7QUFDdkQsTUFBTSxrQkFBa0IsR0FBRyxLQUFLLEVBQUUsU0FBaUIsRUFBRSxNQUFXLEVBQUUsT0FBZSxFQUFtQixFQUFFO0lBQ3BHLElBQUksQ0FBQztRQUNILE1BQU0sTUFBTSxHQUFHLE1BQU0scUJBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFFL0MscUNBQXFDO1FBQ3JDLElBQUksT0FBTyxHQUFRLElBQUksQ0FBQztRQUN4QixJQUFJLENBQUM7WUFDSCxNQUFNLEtBQUssR0FBRyxvREFBb0QsTUFBTSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQ3pGLE1BQU0sV0FBVyxHQUFHLE1BQU0sZ0JBQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFO2dCQUMvQyxvQkFBb0IsRUFBRSxHQUFHO2dCQUN6QixJQUFJLEVBQUUsS0FBSztnQkFDWCxNQUFNLEVBQUUsQ0FBQztnQkFDVCxLQUFLLEVBQUUsRUFBRTthQUNWLENBQUMsQ0FBQztZQUNILE9BQU8sR0FBRyxNQUFNLE1BQU0sQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDL0MsQ0FBQztRQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7WUFDZixPQUFPLENBQUMsS0FBSyxDQUFDLCtEQUErRCxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3hGLENBQUM7UUFFRCx5QkFBeUI7UUFDekIsSUFBSSxhQUFhLEdBQUcsRUFBRSxDQUFDO1FBQ3ZCLElBQUksY0FBYyxHQUFHLElBQUEsYUFBRyxFQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDeEMsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLGNBQWMsS0FBSyxV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