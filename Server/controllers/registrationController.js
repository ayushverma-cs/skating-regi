import Registration from "../models/Registration.js";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createAdminSession } from "../middleware/adminAuth.js";

const allowedCategories = ["Adjustable Skate", "Toy Skate", "Quad", "Inline"];
const allowedRegions = ["Agra", "Mathura", "Firozabad", "Mainpuri"];
const uploadsDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../uploads");

const cleanText = (value, maxLength) => typeof value === "string" ? value.trim().slice(0, maxLength) : "";

export const registrationPayload = (data) => {
  const fullName = cleanText(data.fullName, 80);
  const fatherName = cleanText(data.fatherName, 80);
  const email = cleanText(data.email, 120).toLowerCase();
  const mobile = cleanText(data.mobile, 10);
  const category = cleanText(data.category, 30);
  const gender = cleanText(data.gender, 10);
  const club = cleanText(data.club, 100);
  const coachName = cleanText(data.coachName, 80);
  const state = cleanText(data.state, 100);
  const aadhaarCard = cleanText(data.aadhaarCard, 200);
  const dobCertificate = cleanText(data.dobCertificate, 200);
  const paymentScreenshot = cleanText(data.paymentScreenshot, 200);

  const races = Array.isArray(data.races) ? data.races.filter((race) => typeof race === "string") : [];
  const validRaces = category === "Adjustable Skate" || category === "Toy Skate" ? races.length === 1 && races[0] === "3 Laps" : races.length === 2 && races.includes("5 Laps") && races.includes("8 Laps");
  const candidatePhoto = cleanText(data.candidatePhoto, 200);
  if (!fullName || !fatherName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !data.dob || !cleanText(data.ageGroup, 50) || !club || !allowedRegions.includes(state) || !/^[6-9]\d{9}$/.test(mobile) || !allowedCategories.includes(category) || !["Male", "Female"].includes(gender) || !validRaces || !aadhaarCard.startsWith("/uploads/documents/") || !dobCertificate.startsWith("/uploads/documents/") || !candidatePhoto.startsWith("/uploads/candidates/") || !paymentScreenshot.startsWith("/uploads/payments/")) {
    throw new Error("Invalid registration data.");
  }

  return { fullName, fatherName, email, mobile, category, gender, club, coachName, state, aadhaarCard, dobCertificate, candidatePhoto, paymentScreenshot, dob: data.dob, ageGroup: cleanText(data.ageGroup, 50), races, amountPaid: 500, paymentStatus: "Pending Verification" };
};

export const saveVerifiedRegistration = async (data, paymentId) => {
  const payload = registrationPayload(data);
  const registrationId = `RSM2026${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
  return Registration.create({ ...payload, registrationId, paymentId });
};

export const createRegistration = async (req, res) => {
  try {
    const registration = await saveVerifiedRegistration(req.body, `MANUAL-${crypto.randomBytes(8).toString("hex")}`);
    res.status(201).json({ success: true, message: "Payment screenshot received for verification.", registration });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || "Unable to submit registration." });
  }
};

export const adminLogin = async (req, res) => {
  const password = typeof req.body.password === "string" ? req.body.password : "";
  const configuredPassword = process.env.ADMIN_PASSWORD || "";
  const isValid = configuredPassword.length > 0 && password.length === configuredPassword.length && crypto.timingSafeEqual(Buffer.from(password), Buffer.from(configuredPassword));
  if (!isValid) return res.status(401).json({ success: false, message: "Invalid admin password." });
  try {
    const registrations = await Registration.find().sort({ createdAt: -1 });
    res.json({ success: true, token: createAdminSession(), registrations });
  } catch (error) {
    res.status(500).json({ success: false, message: "Unable to load registrations." });
  }
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
  const folders = { candidates: "candidates", rsfi: "rsfi", documents: "documents", payments: "payments" };
  const folder = folders[req.params.type];
  const filename = path.basename(req.params.filename);
  if (!folder || filename !== req.params.filename) return res.status(400).json({ success: false, message: "Invalid document request." });
  const documentPath = path.join(uploadsDirectory, folder, filename);
  if (!fs.existsSync(documentPath)) return res.status(404).json({ success: false, message: "Document not found." });
  res.sendFile(documentPath);
};
