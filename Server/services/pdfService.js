import PDFParser from "pdf2json";
import { createWorker } from "tesseract.js";

const dobFromText = (text) => {
  const dobRegex = /(?:Date\s*of\s*Birth|DOB|Year\s*of\s*Birth)\s*:?\s*(\d{1,2}[\/-]\d{1,2}[\/-]\d{4}|\d{4}[\/-]\d{1,2}[\/-]\d{1,2}|\d{4})/i;
  const match = text.match(dobRegex);
  if (!match) return "";
  const value = match[1];
  if (/^\d{4}$/.test(value)) return `${value}-01-01`;
  const parts = value.split(/[\/-]/).map(Number);
  return parts[0] > 999 ? `${parts[0]}-${String(parts[1]).padStart(2, "0")}-${String(parts[2]).padStart(2, "0")}` : `${parts[2]}-${String(parts[1]).padStart(2, "0")}-${String(parts[0]).padStart(2, "0")}`;
};

export const extractDOB = (filePath) => {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();

    pdfParser.on("pdfParser_dataError", (err) => {
      reject(err.parserError);
    });

    pdfParser.on("pdfParser_dataReady", (pdfData) => {
      let text = "";

      pdfData.Pages.forEach((page) => {
        page.Texts.forEach((item) => {
          item.R.forEach((r) => {
            text += decodeURIComponent(r.T) + " ";
          });
        });
      });

      const dob = dobFromText(text);
      if (!dob) {
        return reject(new Error("Date of Birth not found."));
      }
      resolve(dob);
    });

    pdfParser.loadPDF(filePath);
  });
};

export const extractDOBFromImage = async (filePath) => {
  const worker = await createWorker("eng");
  try {
    const result = await worker.recognize(filePath);
    const dob = dobFromText(result.data.text);
    if (!dob) throw new Error("Date of Birth not found.");
    return dob;
  } finally { await worker.terminate(); }
};

export const checkPaymentScreenshot = async (filePath) => {
  const worker = await createWorker("eng");
  try {
    const result = await worker.recognize(filePath);
    const text = result.data.text.replace(/\s+/g, " ").trim();
    const hasPaidIndicator = /(?:payment\s*)?(?:successful|success|completed|paid)|transaction\s*(?:successful|completed)/i.test(text);
    const amountMatch = text.match(/(?:₹|rs\.?|inr)\s*500(?:\.00)?\b|\b500\.00\b|amount\D{0,12}\b500\b/i);
    return { hasPaidIndicator, amount: amountMatch ? 500 : 0, text: text.slice(0, 500) };
  } finally { await worker.terminate(); }
};
