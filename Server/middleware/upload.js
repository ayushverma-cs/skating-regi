import multer from "multer";
import path from "path";
import fs from "fs";

const folders = { candidatePhoto: "uploads/candidates", rsfiCard: "uploads/rsfi", aadhaarCard: "uploads/documents", dobCertificate: "uploads/documents" };
Object.values(folders).forEach((folder) => { if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true }); });
const storage = multer.diskStorage({ destination: (req, file, cb) => cb(null, folders[file.fieldname] || "uploads/documents"), filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname).toLowerCase()}`) });
const fileFilter = (req, file, cb) => {
  const photo = file.fieldname === "candidatePhoto";
  const extension = path.extname(file.originalname).toLowerCase();
  const valid = photo ? [".jpg", ".jpeg", ".png"] : [".jpg", ".jpeg", ".png", ".pdf"];
  cb(null, valid.includes(extension));
};
export default multer({ storage, fileFilter, limits: { fileSize: 100 * 1024 * 1024 } });
