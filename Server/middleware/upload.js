import multer from "multer";
import path from "path";
import fs from "fs";

// Create uploads folder if it doesn't exist
const rsfiUploadPath = "uploads/rsfi";
const candidateUploadPath = "uploads/candidates";

[rsfiUploadPath, candidateUploadPath].forEach((uploadPath) => {
  if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
});

// Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, file.fieldname === "candidatePhoto" ? candidateUploadPath : rsfiUploadPath);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(
      null,
      uniqueName + path.extname(file.originalname)
    );
  },
});

// File Filter
const fileFilter = (req, file, cb) => {

  const isCandidatePhoto = file.fieldname === "candidatePhoto";
  const allowedExtensions = isCandidatePhoto ? [".jpg", ".jpeg", ".png"] : [".jpg", ".jpeg", ".png", ".pdf"];
  const allowedMimeTypes = isCandidatePhoto ? ["image/jpeg", "image/png"] : ["image/jpeg", "image/png", "application/pdf"];
  const ext = allowedExtensions.includes(path.extname(file.originalname).toLowerCase());
  const mime = allowedMimeTypes.includes(file.mimetype);

  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG and PDF are allowed."));
  }
};

const upload = multer({
  storage,
  fileFilter,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export default upload;
