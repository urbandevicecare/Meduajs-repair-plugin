import fs from "fs";
import path from "path";
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import PDFDocument from "pdfkit";
import { PDFDocument as PDFLibDoc } from "pdf-lib";
import QRCode from "qrcode";
import { REPAIR_MODULE } from "../modules/repair";
import RepairModuleService from "../modules/repair/service";
import { ZohoBooksService } from "../services/zoho-books.js";

// Helpers
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const embedQRCodeInPdf = async (pdfBuffer: Buffer, ticketNumber: string): Promise<Buffer> => {
  try {
    const pdfDoc = await PDFLibDoc.load(pdfBuffer);
    const qrUrl = `${process.env.STORE_URL || "http://localhost:3000"}/store/repairs/track?number=${ticketNumber}`;
    const qrBufferLib = await QRCode.toBuffer(qrUrl, {
      errorCorrectionLevel: "H",
      type: "png",
      margin: 1,
      width: 70,
    });
    const qrImage = await pdfDoc.embedPng(qrBufferLib);
    const pages = pdfDoc.getPages();
    if (pages.length > 0) {
      const firstPage = pages[0];
      firstPage.drawImage(qrImage, {
        x: 270,
        y: firstPage.getHeight() - 110,
        width: 70,
        height: 70,
      });
    }
    const modifiedPdfBytes = await pdfDoc.save();
    return Buffer.from(modifiedPdfBytes);
  } catch (e) {
    console.error("[embedQRCodeInPdf] Error embedding QR code:", e);
    return pdfBuffer; // fallback to original
  }
};

const formatDate = (dateString: string | Date) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
};

export async function generateRepairDocument(
  docType: string,
  ticket: any,
  customerName: string,
  res: MedusaResponse,
  req: MedusaRequest,
) {
  const repairService: RepairModuleService = req.scope.resolve(REPAIR_MODULE);
  const [settings] = await repairService.listRepairSettings({});
  let zohoError = "";
  
  if (!settings?.zoho_books_enabled) { zohoError = "Zoho Books Integration is disabled in Admin settings."; } else if (!settings.zoho_client_id || !settings.zoho_client_secret || !settings.zoho_refresh_token || !settings.zoho_organization_id) { zohoError = "Zoho Books enabled but missing API credentials."; } else {
    const logger = req.scope.resolve("logger");
    const zoho = new ZohoBooksService({
      client_id: settings.zoho_client_id,
      client_secret: settings.zoho_client_secret,
      refresh_token: settings.zoho_refresh_token,
      organization_id: settings.zoho_organization_id,
      domain: settings.zoho_domain || "com",
    }, logger);

    try {
      // 1. Sync Contact
      let customerObj: any = { email: `guest-${ticket.id}@example.com`, first_name: customerName };
      if (ticket.customer_id) {
        const customerModule = req.scope.resolve("customer", { allowUnregistered: true });
        if (customerModule) {
          const c = await customerModule.retrieveCustomer(ticket.customer_id);
          if (c) customerObj = c;
        }
      }
      
      const contactId = await zoho.syncContact(customerObj);
      
      // 2. Generate Estimate or Invoice or Receipt
      const metadata = ticket.metadata || {};

      if (docType === "quote") {
        let estId = metadata.zoho_estimate_id as string;
        if (!estId) {
          estId = await zoho.createEstimate(contactId, ticket);
          await repairService.updateRepairTickets({ id: ticket.id, metadata: { ...metadata, zoho_estimate_id: estId } });
        }
        const pdfBuffer = await zoho.getDocumentPdf(estId, "estimate");
        const modifiedBuffer = await embedQRCodeInPdf(Buffer.from(pdfBuffer), ticket.ticket_number);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `inline; filename="Repair-Quote-${ticket.ticket_number}.pdf"`);
        return res.send(modifiedBuffer);
      } else if (docType === "receipt" && metadata.zoho_payment_id) {
        const pdfBuffer = await zoho.getPaymentReceiptPdf(metadata.zoho_payment_id as string);
        const modifiedBuffer = await embedQRCodeInPdf(Buffer.from(pdfBuffer), ticket.ticket_number);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `inline; filename="Repair-Receipt-${ticket.ticket_number}.pdf"`);
        return res.send(modifiedBuffer);
      } else if (docType === "invoice") {
        let invId = metadata.zoho_invoice_id as string;
        if (!invId) {
          invId = await zoho.createInvoice(contactId, ticket);
          await repairService.updateRepairTickets({ id: ticket.id, metadata: { ...metadata, zoho_invoice_id: invId } });
        }
        const pdfBuffer = await zoho.getDocumentPdf(invId, "invoice");
        const modifiedBuffer = await embedQRCodeInPdf(Buffer.from(pdfBuffer), ticket.ticket_number);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `inline; filename="Repair-Invoice-${ticket.ticket_number}.pdf"`);
        return res.send(modifiedBuffer);
      }
      // If docType is "job_card" or anything else, it bypasses Zoho and generates locally using PDFKit
    } catch (e: any) {
      zohoError = `Zoho Error: ${e.message}`; logger.error(`Zoho Books Integration failed: ${e.message}. Falling back to local PDF generation.`);
    }
  }

  const parseNum = (val: any) => {
    if (!val) return 0;
    if (typeof val === "object" && "value" in val) return Number(val.value) ;
    return Number(val) ;
  };

  const tTotal = parseNum(ticket.total_estimate);
  const tActual = parseNum(ticket.total_actual);
  const finalTotal = ticket.status === "completed" && tActual > 0 ? tActual : tTotal;

  // Generate QR code
  const qrUrl = `${process.env.STORE_URL || "http://localhost:3000"}/store/repairs/track?number=${ticket.ticket_number}`;
  let qrBuffer: Buffer | null = null;
  try {
    qrBuffer = await QRCode.toBuffer(qrUrl, {
      errorCorrectionLevel: "H",
      type: "png",
      margin: 1,
      width: 60,
    });
  } catch (e) {}

  const doc = new PDFDocument({ margin: 50, size: "A4" });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${ticket.ticket_number}-${docType}.pdf"`,
  );

  doc.pipe(res);

  // 1. Logo
  try {
      const logoPath = path.resolve(process.cwd(), "src/utils/assets/logo.png");
      if (fs.existsSync(logoPath)) {
          doc.image(logoPath, 50, 40, { width: 140 });
      } else {
          doc.fontSize(28).font("Helvetica-Bold").fillColor("#333").text("URBAN", 50, 50, { continued: true }).fillColor("#666").text(" DEVICE CARE");
          doc.fontSize(10).fillColor("#999").text("SINCE 2025", 50, 80);
      }
  } catch (e) {
      doc.fontSize(28).font("Helvetica-Bold").fillColor("#333").text("URBAN", 50, 50, { continued: true }).fillColor("#666").text(" DEVICE CARE");
      doc.fontSize(10).fillColor("#999").text("SINCE 2025", 50, 80);
  }

  // 2. Document Title & Number
  let title = "INVOICE";
  let prefix = "INV";
  if (docType === "job_card") { title = "JOB CARD"; prefix = "JOB"; }
  else if (docType === "receipt") { title = "RECEIPT"; prefix = "REC"; }
  else if (docType === "quote") { title = "QUOTATION"; prefix = "QUO"; }

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
  } else if (docType === "receipt") {
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
  const addMetaRow = (label: string, value: string, yPos: number) => {
      doc.font("Helvetica").fillColor("#333").text(label, 300, yPos, { width: 100, align: "right" });
      doc.text(value, 420, yPos, { width: 120, align: "right" });
  };

  let rowY = metaY;
  if (docType === "quote") {
      addMetaRow("Quote Date :", formatDate(ticket.created_at || new Date()), rowY); rowY += 15;
      const validUntil = new Date(ticket.created_at || new Date());
      validUntil.setDate(validUntil.getDate() + 14);
      addMetaRow("Valid Until :", formatDate(validUntil), rowY); rowY += 15;
  } else if (docType === "job_card") {
      addMetaRow("Intake Date :", formatDate(ticket.created_at || new Date()), rowY); rowY += 15;
      addMetaRow("Status :", String(ticket.status || "Unknown").toUpperCase(), rowY); rowY += 15;
  } else if (docType === "receipt") {
      addMetaRow("Payment Date :", formatDate(new Date()), rowY); rowY += 15;
  } else {
      addMetaRow("Invoice Date :", formatDate(ticket.created_at || new Date()), rowY); rowY += 15;
      addMetaRow("Terms :", "Due on Receipt", rowY); rowY += 15;
      addMetaRow("Due Date :", formatDate(ticket.created_at || new Date()), rowY); rowY += 15;
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
  } else {
      doc.text("Qty", 350, tableTop + 6, { width: 30, align: "center" });
      doc.text("Rate", 390, tableTop + 6, { width: 60, align: "right" });
      doc.text("Amount", 460, tableTop + 6, { width: 75, align: "right" });
  }

  let currentY = tableTop + 30;
  doc.fillColor("#333333").font("Helvetica").fontSize(9);

  let i = 1;
  const drawRow = (desc: string, qty: number, rate: number, amt: number) => {
      // Ensure we don't bleed off the page, if we do we'd normally add a new page
      if (currentY > 650) {
          doc.addPage();
          currentY = 50;
      }
      
      doc.text(i.toString(), 60, currentY);
      
      if (docType === "job_card") {
          doc.text(desc, 90, currentY, { width: 350 });
          doc.text(qty.toFixed(2), 460, currentY, { width: 30, align: "center" });
      } else {
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

  const addSummaryRow = (label: string, value: string, yPos: number, isBold: boolean = false, valColor: string = "#333", bg: boolean = false) => {
      if (bg) {
          doc.rect(250, yPos - 5, 295, 20).fill("#F4F4F4");
      }
      doc.font(isBold ? "Helvetica-Bold" : "Helvetica").fillColor("#333").fontSize(9);
      doc.text(label, summaryX, yPos, { width: 80, align: "right" });
      doc.fillColor(valColor).font(isBold ? "Helvetica-Bold" : "Helvetica").text(value, summaryX + 90, yPos, { width: 95, align: "right" });
  };

  if (docType !== "job_card") {
      addSummaryRow("Sub Total", formatCurrency(finalTotal), currentY); currentY += 20;
      doc.moveTo(300, currentY - 10).lineTo(545, currentY - 10).lineWidth(0.5).strokeColor("#DDDDDD").stroke();

      addSummaryRow("Total", `KES${formatCurrency(finalTotal)}`, currentY, true); currentY += 20;

      if (docType === "invoice" || docType === "receipt") {
          addSummaryRow("Payment Made", `(-) ${formatCurrency(paymentMade)}`, currentY, false, "#C00000"); currentY += 20;
          addSummaryRow("Balance Due", `KES${formatCurrency(balanceDue)}`, currentY, true, "#000", true); currentY += 20;
      }
  }

  // Signatures for job card
  if (docType === "job_card") {
      currentY += 50;
      if (currentY > 650) { doc.addPage(); currentY = 50; }
      
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

  if (zohoError) { doc.fontSize(8).fillColor("red").text(zohoError, 50, footerY + 30, { lineBreak: false }); }
  
  doc.moveTo(50, footerY + 45).lineTo(545, footerY + 45).lineWidth(0.5).strokeColor("#CCCCCC").stroke();
  doc.fontSize(8).fillColor("#999").text("POWERED BY URBAN DEVICE CARE", 50, footerY + 55, { lineBreak: false });
  doc.text("1", 530, footerY + 55, { align: "right", lineBreak: false });

  doc.end();
}
