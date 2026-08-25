import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema({
  rsfiRegistrationNo: { type: String, default: "", trim: true },
  fullName: { type: String, required: true, trim: true },
  dob: { type: Date, required: true },
  ageGroup: { type: String, required: true },
  gender: { type: String, required: true, enum: ["Male", "Female"] },
  category: { type: String, required: true, enum: ["Adjustable Skate", "Toy Skate", "Quad", "Inline"] },
  races: { type: [String], required: true },
  club: { type: String, required: true, trim: true },
  coachName: { type: String, required: true, trim: true },
  mobile: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  aadhaarCard: { type: String, required: true },
  dobCertificate: { type: String, required: true },
  rsfiCard: { type: String, default: "" },
  registrationId: { type: String, unique: true },
  paymentId: { type: String, unique: true, sparse: true, default: "" },
  amountPaid: { type: Number, default: 500 },
  paymentStatus: { type: String, enum: ["Pending", "Paid", "Failed"], default: "Pending" },
  approvalStatus: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
}, { timestamps: true });

export default mongoose.model("Registration", registrationSchema);
