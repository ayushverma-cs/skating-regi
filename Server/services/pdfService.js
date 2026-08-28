import fs from "fs/promises";
import PDFParser from "pdf2json";
import sharp from "sharp";
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

const prepareImageForOcr = async (filePath) => {
  const processedFilePath = `${filePath}.ocr.png`;
  await sharp(filePath)
    .rotate()
    .resize({ width: 2200, withoutEnlargement: false })
    .flatten({ background: "#ffffff" })
    .grayscale()
    .normalize()
    .sharpen()
    .png()
    .toFile(processedFilePath);
  return processedFilePath;
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
  const processedFilePath = `${filePath}.ocr.png`;
  const worker = await createWorker("eng");
  try {
    await prepareImageForOcr(filePath);

    for (const pageSegmentationMode of ["11", "6"]) {
      await worker.setParameters({ tessedit_pageseg_mode: pageSegmentationMode });
      const result = await worker.recognize(processedFilePath);
      const dob = dobFromText(result.data.text);
      if (dob) return dob;
    }
    throw new Error("Date of Birth not found.");
  } finally {
    await worker.terminate();
    await fs.rm(processedFilePath, { force: true });
  }
};

export const checkPaymentScreenshot = async (filePath) => {
  const processedFilePath = `${filePath}.ocr.png`;
  const worker = await createWorker("eng");
  try {
    await prepareImageForOcr(filePath);
    await worker.setParameters({ tessedit_pageseg_mode: "11" });
    const result = await worker.recognize(processedFilePath);
    const text = result.data.text.replace(/\s+/g, " ").trim();
    const hasPaidIndicator = /(?:payment|transaction|upi|transfer)?\s*(?:successful|success|completed)|(?:paid|received|sent|debited)\s+(?:to|₹|rs\.?|inr|\d)/i.test(text);
    const amountMatch = text.match(/(?:₹|rs\.?|inr|amount|paid|payment|total|debited|sent|transfer(?:red)?)\D{0,24}\b500(?:[.,]00)?\b|\b500[.,]00\b/i);
    return { hasPaidIndicator, amount: amountMatch ? 500 : 0, text: text.slice(0, 500) };
  } finally {
    await worker.terminate();
    await fs.rm(processedFilePath, { force: true });
  }
};
