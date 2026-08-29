import fs from "fs/promises";
import PDFParser from "pdf2json";
import sharp from "sharp";
import { createWorker } from "tesseract.js";

const toIsoDob = (dayValue, monthValue, yearValue) => {
  const day = Number(dayValue);
  const month = Number(monthValue);
  const year = Number(yearValue);
  const date = new Date(Date.UTC(year, month - 1, day));
  const currentYear = new Date().getUTCFullYear();
  if (year < 1900 || year > currentYear || date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return "";
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};

// Aadhaar OCR commonly confuses O/0 and B/8, and uploads are often photographed sideways.
const dobFromText = (text) => {
  const normalizedText = String(text || "").replace(/\s+/g, " ");
  const labeledDate = /(?:date\s*of\s*birth|d\s*[o0]\s*[b8]|dob)\s*[:\-]?\s*(\d{1,2})\s*[\/.\-]\s*(\d{1,2})\s*[\/.\-]\s*((?:19|20)\d{2})/i;
  const match = normalizedText.match(labeledDate);
  if (match) return toIsoDob(match[1], match[2], match[3]);

  // Some Aadhaar cards print only the date near the holder details.  Use this
  // only when exactly one plausible DOB is present, so an issue/print date is
  // never silently selected from a busy document.
  const dates = [...normalizedText.matchAll(/\b(\d{1,2})\s*[\/.\-]\s*(\d{1,2})\s*[\/.\-]\s*((?:19|20)\d{2})\b/g)]
    .map((dateMatch) => toIsoDob(dateMatch[1], dateMatch[2], dateMatch[3]))
    .filter(Boolean);
  return [...new Set(dates)].length === 1 ? dates[0] : "";
};

const prepareImageForOcr = async (filePath, angle = 0) => {
  const processedFilePath = `${filePath}.ocr-${angle}.png`;
  await sharp(filePath)
    .autoOrient()
    .rotate(angle)
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
  const worker = await createWorker("eng");
  const processedFiles = [];
  try {
    // EXIF orientation is handled above. These additional rotations cover a
    // sideways scan or photograph where the pixels themselves are rotated.
    for (const angle of [0, 90, 270, 180]) {
      const processedFilePath = await prepareImageForOcr(filePath, angle);
      processedFiles.push(processedFilePath);
      for (const pageSegmentationMode of ["11", "6"]) {
        await worker.setParameters({ tessedit_pageseg_mode: pageSegmentationMode });
        const result = await worker.recognize(processedFilePath);
        const dob = dobFromText(result.data.text);
        if (dob) return dob;
      }
    }
    throw new Error("Date of Birth not found.");
  } finally {
    await worker.terminate();
    await Promise.all(processedFiles.map((processedFilePath) => fs.rm(processedFilePath, { force: true })));
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
