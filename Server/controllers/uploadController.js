import path from "path";
import crypto from "crypto";
import fs from "fs/promises";
import os from "os";
import { extractDOB, extractDOBFromImage } from "../services/pdfService.js";
import { calculateAgeGroup } from "../utils/calculateAgeGroup.js";
import UploadedFile from "../models/UploadedFile.js";

// Full Aadhaar scans can contain both sides and need several rotation passes.
// Give OCR enough time to finish, while still preventing an unbounded request.
const OCR_TIMEOUT_MS = 75_000;
const withTimeout = (promise, timeout = OCR_TIMEOUT_MS) => Promise.race([
  promise,
  new Promise((_, reject) => setTimeout(() => reject(new Error("Document reading timed out.")), timeout)),
]);

const folderFor = (field) => field === "candidatePhoto" ? "candidates" : field === "paymentScreenshot" ? "payments" : field === "rsfiCard" ? "rsfi" : "documents";
const saveUpload = async (file) => {
  const storageName = `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`;
  const folder = folderFor(file.fieldname);
  await UploadedFile.create({ storageName, folder, originalName: file.originalname, mimeType: file.mimetype || "application/octet-stream", data: file.buffer });
  return { folder, storageName };
};
const withTemporaryFile = async (file, action) => {
  const temporaryPath = path.join(os.tmpdir(), `skating-${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`);
  await fs.writeFile(temporaryPath, file.buffer);
  try { return await action(temporaryPath); } finally { await fs.rm(temporaryPath, { force: true }); }
};

export const uploadRSFICard = async (req, res) => {

  try {

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded."
      });
    }

    let dob = "";
    let ageGroup = "";

    const extension = path.extname(req.file.originalname).toLowerCase();

    if (extension === ".pdf") {

      dob = await withTemporaryFile(req.file, extractDOB);

      ageGroup = calculateAgeGroup(dob);

    }

    res.status(200).json({

      success: true,

      message: "RSFI Uploaded Successfully",

      file: (await saveUpload(req.file)).storageName,

      dob,

      ageGroup

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      message: error.message

    });

  }

};

export const uploadCandidatePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No candidate photo uploaded." });
    }

    if (!req.file.mimetype.startsWith("image/")) {
      return res.status(400).json({ success: false, message: "Candidate photo must be a JPG or PNG image." });
    }

    const { storageName } = await saveUpload(req.file);
    res.status(200).json({
      success: true,
      message: "Candidate photo uploaded successfully",
      photoUrl: `/uploads/candidates/${storageName}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadPaymentScreenshot = async (req, res) => {
  try {
    if (!req.file || req.file.fieldname !== "paymentScreenshot") {
      return res.status(400).json({ success: false, message: "Please upload a JPG or PNG payment screenshot." });
    }
    const { storageName } = await saveUpload(req.file);
    res.status(200).json({ success: true, documentUrl: `/uploads/payments/${storageName}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Screenshot upload failed." });
  }
};

export const uploadDocument = async (req, res) => {
  try {
    const file = req.files?.[0];
    if (!file || !["aadhaarCard", "dobCertificate", "candidatePhoto", "paymentScreenshot"].includes(file.fieldname)) return res.status(400).json({ success: false, message: "No valid document uploaded." });
    const { folder, storageName } = await saveUpload(file);
    let dob = ""; let ageGroup = "";
    if (file.fieldname === "aadhaarCard") {
      try {
        dob = await withTemporaryFile(file, (temporaryPath) => path.extname(file.originalname).toLowerCase() === ".pdf"
          ? extractDOB(temporaryPath)
          : withTimeout(extractDOBFromImage(temporaryPath)));
        ageGroup = calculateAgeGroup(dob);
      } catch { /* The card was saved; the user can enter DOB manually if OCR cannot read it. */ }
    }
    res.status(200).json({ success: true, documentUrl: `/uploads/${folder}/${storageName}`, dob, ageGroup });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
