import Registration from "../models/Registration.js";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { createAdminSession } from "../middleware/adminAuth.js";

const allowedDisciplines = ["Inline", "Quad", "Skateboard", "Roller Freestyle"];

const cleanText = (value, maxLength) => typeof value === "string" ? value.trim().slice(0, maxLength) : "";

export const registrationPayload = (data) => {
  const fullName = cleanText(data.fullName, 80);
  const fatherName = cleanText(data.fatherName, 80);
  const mobile = cleanText(data.mobile, 10);
  const discipline = cleanText(data.discipline, 30);
  const gender = cleanText(data.gender, 10);
  const candidatePhoto = cleanText(data.candidatePhoto, 200);
  const rsfiCard = cleanText(data.rsfiCard, 200);

  if (!fullName || !fatherName || !/^[6-9]\d{9}$/.test(mobile) || !allowedDisciplines.includes(discipline) || !["Male", "Female", "Other"].includes(gender) || !candidatePhoto.startsWith("/uploads/candidates/")) {
    throw new Error("Invalid registration data.");
  }

  if (["Inline", "Quad"].includes(discipline) && !rsfiCard.startsWith("/uploads/rsfi/")) {
    throw new Error("A valid RSFI card is required for this discipline.");
  }

  return { fullName, fatherName, mobile, discipline, gender, candidatePhoto, rsfiCard, dob: data.dob || undefined, ageGroup: cleanText(data.ageGroup, 20), events: [discipline], amountPaid: 1, paymentStatus: "Paid" };
};

export const saveVerifiedRegistration = async (data, paymentId) => {
  const payload = registrationPayload(data);
  const registrationId = `RSM2026${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
  return Registration.create({ ...payload, registrationId, paymentId });
};

export const createRegistration = async (req, res) => {
  res.status(403).json({ success: false, message: "Registrations are created only after verified payment." });
};

export const adminLogin = (req, res) => {
  const password = typeof req.body.password === "string" ? req.body.password : "";
  const configuredPassword = process.env.ADMIN_PASSWORD || "";
  const isValid = configuredPassword.length > 0 && password.length === configuredPassword.length && crypto.timingSafeEqual(Buffer.from(password), Buffer.from(configuredPassword));
  if (!isValid) return res.status(401).json({ success: false, message: "Invalid admin password." });
  res.json({ success: true, token: createAdminSession() });
};

export const getRegistrationsForAdmin = async (req, res) => {
  try {
    const registrations = await Registration.find().sort({ createdAt: -1 });
    res.json({ success: true, registrations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateRegistrationApproval = async (req, res) => {
  const { approvalStatus } = req.body;
  if (!['Approved', 'Rejected'].includes(approvalStatus)) {
    return res.status(400).json({ success: false, message: "Invalid approval status." });
  }

  try {
    const registration = await Registration.findByIdAndUpdate(
      req.params.id,
      { approvalStatus },
      { new: true }
    );

    if (!registration) return res.status(404).json({ success: false, message: "Registration not found." });
    res.json({ success: true, registration });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const serveAdminDocument = (req, res) => {
  const folders = { candidates: "uploads/candidates", rsfi: "uploads/rsfi" };
  const folder = folders[req.params.type];
  const filename = path.basename(req.params.filename);
  if (!folder || filename !== req.params.filename) return res.status(400).json({ success: false, message: "Invalid document request." });
  const documentPath = path.resolve(folder, filename);
  if (!fs.existsSync(documentPath)) return res.status(404).json({ success: false, message: "Document not found." });
  res.sendFile(documentPath);
};
