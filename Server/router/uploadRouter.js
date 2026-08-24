import express from "express";

import upload from "../middleware/upload.js";

import { uploadCandidatePhoto, uploadRSFICard } from "../controllers/uploadController.js";

const router = express.Router();

router.post(

  "/",

  upload.single("rsfiCard"),

  uploadRSFICard

);

router.post("/candidate-photo", upload.single("candidatePhoto"), uploadCandidatePhoto);

export default router;
