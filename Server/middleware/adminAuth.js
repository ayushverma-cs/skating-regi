import crypto from "crypto";

const sessions = new Map();
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

export const createAdminSession = () => {
  const token = crypto.randomBytes(32).toString("hex");
  sessions.set(token, Date.now() + SESSION_TTL_MS);
  return token;
};

export const requireAdmin = (req, res, next) => {
  const token = req.get("authorization")?.replace("Bearer ", "");
  const expiresAt = token && sessions.get(token);

  if (!expiresAt || expiresAt < Date.now()) {
    if (token) sessions.delete(token);
    return res.status(401).json({ success: false, message: "Admin session has expired. Please sign in again." });
  }

  next();
};
