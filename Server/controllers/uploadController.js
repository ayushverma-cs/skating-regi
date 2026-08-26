import path from "path";
import { extractDOB, extractDOBFromImage } from "../services/pdfService.js";
import { calculateAgeGroup } from "../utils/calculateAgeGroup.js";

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

export const uploadDocument = async (req, res) => {
  try {
    const file = req.files?.[0];
    if (!file || !["aadhaarCard", "dobCertificate", "candidatePhoto"].includes(file.fieldname)) return res.status(400).json({ success: false, message: "No valid document uploaded." });
    const folder = file.fieldname === "candidatePhoto" ? "candidates" : "documents";
    let dob = ""; let ageGroup = "";
    if (file.fieldname === "aadhaarCard") {
      try {
        dob = path.extname(file.originalname).toLowerCase() === ".pdf" ? await extractDOB(file.path) : await extractDOBFromImage(file.path);
        ageGroup = calculateAgeGroup(dob);
      } catch { /* The card was saved; the user can enter DOB manually if OCR cannot read it. */ }
    }
    res.status(200).json({ success: true, documentUrl: `/uploads/${folder}/${file.filename}`, dob, ageGroup });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
