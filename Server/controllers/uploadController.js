import path from "path";
import { checkPaymentScreenshot, extractDOB, extractDOBFromImage } from "../services/pdfService.js";
import { calculateAgeGroup } from "../utils/calculateAgeGroup.js";

const OCR_TIMEOUT_MS = 25_000;
const PAYMENT_OCR_TIMEOUT_MS = 15_000;
const withTimeout = (promise, timeout = OCR_TIMEOUT_MS) => Promise.race([
  promise,
  new Promise((_, reject) => setTimeout(() => reject(new Error("Document reading timed out.")), timeout)),
]);

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

      dob = await extractDOB(req.file.path);

      ageGroup = calculateAgeGroup(dob);

    }

    res.status(200).json({

      success: true,

      message: "RSFI Uploaded Successfully",

      file: req.file.filename,

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

    res.status(200).json({
      success: true,
      message: "Candidate photo uploaded successfully",
      photoUrl: `/uploads/candidates/${req.file.filename}`,
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
    const paymentCheck = await withTimeout(checkPaymentScreenshot(req.file.path), PAYMENT_OCR_TIMEOUT_MS);
    if (!paymentCheck.hasPaidIndicator || paymentCheck.amount !== 500) {
      return res.status(422).json({ success: false, message: "We could not confirm a successful ₹500 payment from this screenshot. Please upload the payment-success screen showing ₹500." });
    }
    res.status(200).json({ success: true, documentUrl: `/uploads/payments/${req.file.filename}`, paymentCheck: { amount: 500, status: "₹500 payment detected" } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Screenshot upload failed." });
  }
};

export const uploadDocument = async (req, res) => {
  try {
    const file = req.files?.[0];
    if (!file || !["aadhaarCard", "dobCertificate", "candidatePhoto", "paymentScreenshot"].includes(file.fieldname)) return res.status(400).json({ success: false, message: "No valid document uploaded." });
    const folder = file.fieldname === "candidatePhoto" ? "candidates" : file.fieldname === "paymentScreenshot" ? "payments" : "documents";
    let dob = ""; let ageGroup = "";
    if (file.fieldname === "aadhaarCard") {
      try {
        dob = path.extname(file.originalname).toLowerCase() === ".pdf"
          ? await extractDOB(file.path)
          : await withTimeout(extractDOBFromImage(file.path));
        ageGroup = calculateAgeGroup(dob);
      } catch { /* The card was saved; the user can enter DOB manually if OCR cannot read it. */ }
    }
    res.status(200).json({ success: true, documentUrl: `/uploads/${folder}/${file.filename}`, dob, ageGroup });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
