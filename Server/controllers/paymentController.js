import crypto from "crypto";
import razorpay from "../config/razorpay.js";
import { saveVerifiedRegistration } from "./registrationController.js";

// ===============================
// Create Razorpay Order
// ===============================
export const createOrder = async (req, res) => {
  try {
    const options = {
      amount: 500 * 100, // ₹500 (Razorpay amount is in paise)
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// Verify Razorpay Payment
// ===============================
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      registrationData,
    } = req.body;

    const body =
      razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(body)
      .digest("hex");

    const signatureIsValid = typeof razorpay_signature === "string" && razorpay_signature.length === expectedSignature.length && crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(razorpay_signature));
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !registrationData || !signatureIsValid) {
      return res.status(400).json({
        success: false,
        message: "Payment Verification Failed",
      });
    }

    const registration = await saveVerifiedRegistration(registrationData, razorpay_payment_id);

    res.status(201).json({
      success: true,
      message: "Payment Verified Successfully",
      registration,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
