import express from "express";

import upload from "../middleware/upload.js";

import { uploadCandidatePhoto, uploadDocument, uploadPaymentScreenshot, uploadRSFICard } from "../controllers/uploadController.js";

const router = express.Router();

router.post(

  "/",

  upload.single("rsfiCard"),

  uploadRSFICard

);

router.post("/candidate-photo", upload.single("candidatePhoto"), uploadCandidatePhoto);
router.post("/payment-screenshot", upload.single("paymentScreenshot"), uploadPaymentScreenshot);
router.post("/document", upload.any(), uploadDocument, (error, req, res, next) => {
  if (error?.code === "LIMIT_FILE_SIZE") return res.status(413).json({ success: false, message: "Maximum file size is 10 MB." });
  if (error) return res.status(400).json({ success: false, message: error.message || "Unable to upload this file." });
  next();
});

export default router;
