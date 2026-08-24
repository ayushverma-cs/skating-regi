const requests = new Map();

export const apiRateLimit = (req, res, next) => {
  const key = req.ip || req.socket.remoteAddress;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const record = requests.get(key) || { count: 0, resetAt: now + windowMs };
  if (record.resetAt <= now) {
    record.count = 0;
    record.resetAt = now + windowMs;
  }
  record.count += 1;
  requests.set(key, record);
  if (record.count > 100) return res.status(429).json({ success: false, message: "Too many requests. Please try again later." });
  next();
};
