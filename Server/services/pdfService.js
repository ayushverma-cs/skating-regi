import PDFParser from "pdf2json";
import { createWorker } from "tesseract.js";

const dobFromText = (text) => {
  const normalizedText = String(text || "").replace(/\s+/g, " ");
  const dobRegex = /(?:Date\s*of\s*Birth|D\s*[O0]\s*[B8])\s*[:\-]?\s*(\d{1,2})\s*[\/.\-]\s*(\d{1,2})\s*[\/.\-]\s*((?:19|20)\d{2})/i;
  const match = normalizedText.match(dobRegex);
  if (!match) return "";
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  const currentYear = new Date().getUTCFullYear();
  if (year < 1900 || year > currentYear || date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return "";
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
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
    for (const pageSegmentationMode of ["6", "3", "11"]) {
      await worker.setParameters({ tessedit_pageseg_mode: pageSegmentationMode });
      const result = await worker.recognize(filePath);
      const dob = dobFromText(result.data.text);
      if (dob) return dob;
    }
    throw new Error("Date of Birth not found.");
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
