import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  fatherName: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  dob: { type: Date, required: true },
  ageGroup: { type: String, required: true },
  gender: { type: String, required: true, enum: ["Male", "Female"] },
  category: { type: String, required: true, enum: ["Adjustable Skate", "Toy Skate", "Quad", "Inline"] },
  races: { type: [String], required: true },
  club: { type: String, required: true, trim: true },
  coachName: { type: String, default: "", trim: true },
  mobile: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  aadhaarCard: { type: String, required: true },
  dobCertificate: { type: String, required: true },
  candidatePhoto: { type: String, required: true },
  paymentScreenshot: { type: String, required: true },
  registrationId: { type: String, unique: true },
  paymentId: { type: String, unique: true, sparse: true, default: "" },
  amountPaid: { type: Number, default: 500 },
  paymentStatus: { type: String, enum: ["Pending", "Paid", "Failed", "Pending Verification"], default: "Pending Verification" },
  approvalStatus: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
}, { timestamps: true });

export default mongoose.model("Registration", registrationSchema);
