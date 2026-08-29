import multer from "multer";
import path from "path";
const fileFilter = (req, file, cb) => {
  const photo = file.fieldname === "candidatePhoto" || file.fieldname === "paymentScreenshot";
  const extension = path.extname(file.originalname).toLowerCase();
  const valid = photo ? [".jpg", ".jpeg", ".png"] : [".jpg", ".jpeg", ".png", ".pdf"];
  cb(null, valid.includes(extension));
};
export default multer({ storage: multer.memoryStorage(), fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });
