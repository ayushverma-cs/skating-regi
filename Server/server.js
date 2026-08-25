import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import registrationRouter from "./router/registrationRouter.js";
import connectDB from "./config/db.js";
import paymentRouter from "./router/paymentRouter.js";
import uploadRouter from "./router/uploadRouter.js";
import { apiRateLimit } from "./middleware/rateLimit.js";
dotenv.config();

connectDB();

const app = express();
const allowedOrigins = new Set([
  "http://localhost:5173",
  process.env.CLIENT_ORIGIN
].filter(Boolean));
const isVercelDeployment = (origin) => /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin);

app.disable("x-powered-by");
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin) || isVercelDeployment(origin)) return callback(null, true);
    return callback(new Error("Origin is not allowed by CORS."));
  },
  methods: ["GET", "POST", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json({ limit: "100kb" }));
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");

  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});
app.use("/api", apiRateLimit);
app.use("/api/registration", registrationRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/payment", paymentRouter);

app.get("/", (req, res) => {
  res.send("🚀 Roller Skating Championship API Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
