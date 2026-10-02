import { PDFDocument, rgb } from "pdf-lib";
import QRCode from "qrcode";

async function test() {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.addPage([600, 400]);
  const pdfBytes = await pdfDoc.save();
  const pdfBuffer = Buffer.from(pdfBytes);
  
  try {
    const doc = await PDFDocument.load(pdfBuffer);
    const qrBufferLib = await QRCode.toBuffer("http://example.com", {
      errorCorrectionLevel: "H",
      type: "png",
      margin: 1,
      width: 70,
    });
    console.log("QR Code generated successfully");
  } catch (e) {
    console.error("Failed:", e);
  }
}
test();
