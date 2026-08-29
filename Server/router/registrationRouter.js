import express from "express";
import { adminLogin, createRegistration, deleteRegistration, getRegistrationsForAdmin, serveAdminDocument, updateRegistrationApproval } from "../controllers/registrationController.js";
import { requireAdmin } from "../middleware/adminAuth.js";

const router = express.Router();

router.post("/", createRegistration);
router.post("/admin/login", adminLogin);
router.get("/admin", requireAdmin, getRegistrationsForAdmin);
router.patch("/admin/:id/approval", requireAdmin, updateRegistrationApproval);
router.delete("/admin/:id", requireAdmin, deleteRegistration);
router.get("/admin/document/:type/:filename", requireAdmin, serveAdminDocument);

export default router;
