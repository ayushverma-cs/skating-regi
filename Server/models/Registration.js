import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    fatherName: {
      type: String,
      required: true,
      trim: true,
    },

    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female", "Other"],
    },

    mobile: {
      type: String,
      required: true,
      trim: true,
    },

    // Selected by Participant
    discipline: {
      type: String,
      required: true,
      enum: [
        "Inline",
        "Quad",
        "Skateboard",
        "Roller Freestyle",
      ],
    },

    // Auto-filled from RSFI (Inline/Quad)
    // Manual for Skateboard/Freestyle
    dob: {
      type: Date,
    },

    // Auto Calculated
    ageGroup: {
      type: String,
      default: "",
    },

    events: {
      type: [String],
      default: [],
    },

    amountPaid: {
      type: Number,
      default: 1,
    },

    // Uploaded RSFI Card/PDF
    rsfiCard: {
      type: String,
      default: "",
    },

    // Required passport-style candidate photo
    candidatePhoto: {
      type: String,
      required: true,
    },

    // Auto Generated after successful payment
    registrationId: {
      type: String,
      unique: true,
    },

    // Razorpay Payment ID
    paymentId: {
      type: String,
      unique: true,
      sparse: true,
      default: "",
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },

    approvalStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

const Registration = mongoose.model("Registration", registrationSchema);

export default Registration;
