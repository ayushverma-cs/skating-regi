import dotenv from "dotenv";
import fs from "fs/promises";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import Registration from "../models/Registration.js";
import UploadedFile from "../models/UploadedFile.js";

dotenv.config();

const applyChanges = process.argv.includes("--apply");
const uploadsDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../uploads");
const documentFields = [
  ["candidatePhoto", "candidates"],
  ["aadhaarCard", "documents"],
  ["dobCertificate", "documents"],
  ["paymentScreenshot", "payments"],
];
const mimeTypes = {
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".pdf": "application/pdf",
};

const main = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const registrations = await Registration.find({}, documentFields.map(([field]) => field).join(" ")).lean();
  const summary = { registrations: registrations.length, alreadyStored: 0, restorable: 0, restored: 0, unavailable: 0 };

  for (const registration of registrations) {
    for (const [field, folder] of documentFields) {
      const filePath = String(registration[field] || "");
      const expectedPrefix = `/uploads/${folder}/`;
      const storageName = path.basename(filePath);
      if (!filePath.startsWith(expectedPrefix) || !storageName || storageName !== filePath.slice(expectedPrefix.length)) continue;

      if (await UploadedFile.exists({ folder, storageName })) {
        summary.alreadyStored += 1;
        continue;
      }

      const sourcePath = path.join(uploadsDirectory, folder, storageName);
      try {
        const data = await fs.readFile(sourcePath);
        summary.restorable += 1;
        if (applyChanges) {
          await UploadedFile.create({
            storageName,
            folder,
            originalName: storageName,
            mimeType: mimeTypes[path.extname(storageName).toLowerCase()] || "application/octet-stream",
            data,
          });
          summary.restored += 1;
        }
      } catch (error) {
        if (error.code === "ENOENT") summary.unavailable += 1;
        else throw error;
      }
    }
  }

  console.log(JSON.stringify({ mode: applyChanges ? "restore" : "audit", ...summary }));
  await mongoose.disconnect();
};

main().catch(async (error) => {
  console.error(error.message);
  await mongoose.disconnect();
  process.exit(1);
});
