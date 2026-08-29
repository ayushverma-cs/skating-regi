import mongoose from "mongoose";

// Uploads live in MongoDB rather than the server's local disk. Render's disk is
// ephemeral, so keeping only a local path makes documents disappear after a
// restart or redeploy.
const uploadedFileSchema = new mongoose.Schema({
  storageName: { type: String, required: true, unique: true, index: true },
  folder: { type: String, required: true, enum: ["candidates", "documents", "payments", "rsfi"] },
  originalName: { type: String, required: true },
  mimeType: { type: String, required: true },
  data: { type: Buffer, required: true },
}, { timestamps: true });

export default mongoose.model("UploadedFile", uploadedFileSchema);
