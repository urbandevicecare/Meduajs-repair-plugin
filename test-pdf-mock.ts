import fs from "fs";
import { PDFDocument as PDFLibDoc, rgb, StandardFonts, degrees } from "pdf-lib";
import QRCode from "qrcode";

// Extracted from src/utils/generate-repair-document.ts
const postProcessZohoPdf = async (pdfBuffer: Buffer, ticket: any, docType: string): Promise<Buffer> => {
  try {
    const pdfDoc = await PDFLibDoc.load(pdfBuffer);
    
    // 1. Generate & Embed QR Code Safely
    let qrImage: any = null;
    try {
      const qrUrl = `http://localhost:3000/store/repairs/track?number=${ticket.ticket_number}`;
      const qrBufferLib = await QRCode.toBuffer(qrUrl, {
        errorCorrectionLevel: "H",
        type: "png",
        margin: 1,
        width: 70,
      });
      qrImage = await pdfDoc.embedPng(qrBufferLib);
    } catch (qrErr) {
      console.error("[postProcessZohoPdf] QR Code generation skipped due to error:", qrErr);
    }
    
    // 2. Determine Watermark
    let watermarkText = "";
    let watermarkColor = rgb(0.8, 0.8, 0.8);
    const isPaid = ticket.payment_status === "captured" || ticket.payment_status === "paid" || docType === "receipt";
    
    if (docType === "invoice" || docType === "receipt") {
      watermarkText = isPaid ? "PAID" : "UNPAID";
      watermarkColor = isPaid ? rgb(0.13, 0.77, 0.36) : rgb(0.93, 0.26, 0.26); // green vs red
    } else if (docType === "quote") {
      watermarkText = "QUOTATION";
      watermarkColor = rgb(0.8, 0.8, 0.8);
    }
    
    // Override if cancelled
    if (ticket.status === "cancelled") {
      watermarkText = "CANCELLED";
      watermarkColor = rgb(0.93, 0.26, 0.26);
    }
    
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
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
          rotate: degrees(45),
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
        color: rgb(1, 1, 1),
      });
    }

    const modifiedPdfBytes = await pdfDoc.save();
    return Buffer.from(modifiedPdfBytes);
  } catch (e: any) {
    console.error("[postProcessZohoPdf] CRITICAL Error processing PDF:", e?.message || e);
    return pdfBuffer;
  }
};

async function runTest() {
  console.log("Creating dummy Zoho PDF...");
  const pdfDoc = await PDFLibDoc.create();
  const page = pdfDoc.addPage([595, 842]); // A4 size
  
  // Draw some dummy content
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  page.drawText("Zoho Dummy Invoice", { x: 50, y: 800, size: 24, font });
  page.drawText("Total: 10,000 KES", { x: 50, y: 750, size: 14, font });
  
  // Draw "Powered by Zoho Books" near the bottom to test masking
  page.drawText("Powered by Zoho Books", { x: 50, y: 15, size: 10, font, color: rgb(0, 0, 1) });
  
  const dummyPdfBuffer = Buffer.from(await pdfDoc.save());
  
  console.log("Running postProcessZohoPdf for an UNPAID INVOICE...");
  const unpaidTicket = { ticket_number: "RT-12345", payment_status: "pending", status: "ready" };
  const resultPdf = await postProcessZohoPdf(dummyPdfBuffer, unpaidTicket, "invoice");
  
  fs.writeFileSync("/Users/slyb./.gemini/antigravity/brain/7a6c803e-eeb8-42ce-a2f7-ed0ebbc23527/.user_uploaded/mock-unpaid.pdf", resultPdf);
  console.log("Saved mock-unpaid.pdf to artifacts.");
  
  console.log("Running postProcessZohoPdf for a PAID INVOICE...");
  const paidTicket = { ticket_number: "RT-12345", payment_status: "captured", status: "completed" };
  const paidResultPdf = await postProcessZohoPdf(dummyPdfBuffer, paidTicket, "invoice");
  
  fs.writeFileSync("/Users/slyb./.gemini/antigravity/brain/7a6c803e-eeb8-42ce-a2f7-ed0ebbc23527/.user_uploaded/mock-paid.pdf", paidResultPdf);
  console.log("Saved mock-paid.pdf to artifacts.");
}

runTest().catch(console.error);
