"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pdf_lib_1 = require("pdf-lib");
const qrcode_1 = __importDefault(require("qrcode"));
async function test() {
    const pdfDoc = await pdf_lib_1.PDFDocument.create();
    pdfDoc.addPage([600, 400]);
    const pdfBytes = await pdfDoc.save();
    const pdfBuffer = Buffer.from(pdfBytes);
    try {
        const doc = await pdf_lib_1.PDFDocument.load(pdfBuffer);
        const qrBufferLib = await qrcode_1.default.toBuffer("http://example.com", {
            errorCorrectionLevel: "H",
            type: "png",
            margin: 1,
            width: 70,
        });
        console.log("QR Code generated successfully");
    }
    catch (e) {
        console.error("Failed:", e);
    }
}
test();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdF9wZGYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi90ZXN0X3BkZi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLHFDQUEyQztBQUMzQyxvREFBNEI7QUFFNUIsS0FBSyxVQUFVLElBQUk7SUFDakIsTUFBTSxNQUFNLEdBQUcsTUFBTSxxQkFBVyxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQzFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUMzQixNQUFNLFFBQVEsR0FBRyxNQUFNLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNyQyxNQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBRXhDLElBQUksQ0FBQztRQUNILE1BQU0sR0FBRyxHQUFHLE1BQU0scUJBQVcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDOUMsTUFBTSxXQUFXLEdBQUcsTUFBTSxnQkFBTSxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsRUFBRTtZQUM5RCxvQkFBb0IsRUFBRSxHQUFHO1lBQ3pCLElBQUksRUFBRSxLQUFLO1lBQ1gsTUFBTSxFQUFFLENBQUM7WUFDVCxLQUFLLEVBQUUsRUFBRTtTQUNWLENBQUMsQ0FBQztRQUNILE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztJQUNoRCxDQUFDO0lBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztRQUNYLE9BQU8sQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzlCLENBQUM7QUFDSCxDQUFDO0FBQ0QsSUFBSSxFQUFFLENBQUMifQ==