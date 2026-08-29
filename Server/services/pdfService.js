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

// Aadhaar OCR commonly confuses O/0, I/1 and B/8. Only accept a date found
// immediately after a DOB label, so an Aadhaar issue date cannot be selected.
const ocrDigit = (value) => String(value).replace(/[oO]/g, "0").replace(/[ilI|]/g, "1");
export const dobFromText = (text) => {
  const normalizedText = String(text || "").replace(/\s+/g, " ");
  const dobLabel = /(?:date\s*(?:of\s*)?birth\s*(?:[\/|]?\s*(?:d\s*[o0]\s*[b8s5]))?|d\s*[o0]\s*[b8s5])\b/ig;
  const dateAfterLabel = /([0-3]?[\doOilI])\s*[\/.\-]\s*([01]?[\doOilI])\s*[\/.\-]\s*((?:1[9oO]|2[0oO])[\doOilI]{2})/i;

  for (const label of normalizedText.matchAll(dobLabel)) {
    // OCR sometimes puts a line break or a small amount of noise between the
    // label and the date. Looking only this far keeps the match unambiguous.
    const date = normalizedText.slice((label.index || 0) + label[0].length, (label.index || 0) + label[0].length + 48).match(dateAfterLabel);
    if (date) {
      const dob = toIsoDob(ocrDigit(date[1]), ocrDigit(date[2]), ocrDigit(date[3]));
      if (dob) return dob;
    }
  }
  return "";
};

const prepareImageForOcr = async (filePath, angle = 0) => {
  const processedFilePath = `${filePath}.ocr-${angle}.png`;
  await sharp(filePath)
    .autoOrient()
    // Phone screenshots frequently have thick black borders. Removing them
    // lets the Aadhaar text use the available OCR resolution.
    .trim({ background: "#000000", threshold: 20 })
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

const prepareLowerLeftPanelForOcr = async (processedFilePath, region = { left: 0, top: 0.52, width: 0.58, height: 0.48 }) => {
  const image = sharp(processedFilePath);
  const metadata = await image.metadata();
  const width = metadata.width || 0;
  const height = metadata.height || 0;
  const panelPath = `${processedFilePath}.lower-left.png`;
  await image
    // Aadhaar letter scans commonly show the photo/DOB panel in this area.
    // Enlarging it separately makes its small printed DOB legible to OCR.
    .extract({ left: Math.floor(width * region.left), top: Math.floor(height * region.top), width: Math.floor(width * region.width), height: Math.ceil(height * region.height) })
    .resize({ width: 2200, withoutEnlargement: false })
    .normalize()
    .sharpen()
    .png()
    .toFile(panelPath);
  return panelPath;
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
    // Check the lower-left photo/DOB panel first. It is much faster and more
    // reliable for the common full Aadhaar letter layout than OCRing all text.
    const firstPage = await prepareImageForOcr(filePath);
    processedFiles.push(firstPage);
    const focusedDobPanel = await prepareLowerLeftPanelForOcr(firstPage, { left: 0.05, top: 0.67, width: 0.47, height: 0.29 });
    processedFiles.push(focusedDobPanel);
    for (const pageSegmentationMode of ["11", "6"]) {
      await worker.setParameters({ tessedit_pageseg_mode: pageSegmentationMode });
      const result = await worker.recognize(focusedDobPanel);
      const dob = dobFromText(result.data.text);
      if (dob) return dob;
    }

    const lowerLeftPanel = await prepareLowerLeftPanelForOcr(firstPage);
    processedFiles.push(lowerLeftPanel);
    for (const pageSegmentationMode of ["11", "6"]) {
      await worker.setParameters({ tessedit_pageseg_mode: pageSegmentationMode });
      const result = await worker.recognize(lowerLeftPanel);
      const dob = dobFromText(result.data.text);
      if (dob) return dob;
    }

    // EXIF orientation is handled above. These additional rotations cover a
    // sideways scan or photograph where the pixels themselves are rotated.
    for (const angle of [0, 90, 270, 180]) {
      const processedFilePath = angle === 0 ? firstPage : await prepareImageForOcr(filePath, angle);
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
