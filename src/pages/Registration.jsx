import { useState } from "react";
import { validateForm } from "../utils/validateForm";

import Footer from "../components/Footer";
import RegistrationHeader from "../components/RegistrationHeader";
import RegistrationHero from "../components/RegistrationHero";
import ParticipantForm from "../components/ParticipantForm";
import RSFIUpload from "../components/RSFIUpload";
import PaymentSummary from "../components/PaymentSummary";

export default function Registration() {
  const [formData, setFormData] = useState({
    fullName: "",
    fatherName: "",
    gender: "",
    mobile: "",
    discipline: "",
    dob: "",
    ageGroup: "",
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Validation
  const [errors, setErrors] = useState({});
  const [agreed, setAgreed] = useState(false);

  // Prevent multiple clicks
  const [loading, setLoading] = useState(false);

  // Temporary Age Group Calculator
  const calculateAgeGroup = (dob) => {
    if (!dob) return "";

    const birthDate = new Date(dob);
    const cutoffDate = new Date("2026-09-15");

    let age = cutoffDate.getFullYear() - birthDate.getFullYear();

    const monthDiff =
      cutoffDate.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 &&
        cutoffDate.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    if (age < 8) return "U-8";
    if (age < 10) return "U-10";
    if (age < 12) return "U-12";
    if (age < 14) return "U-14";
    if (age < 16) return "U-16";
    if (age < 19) return "U-19";

    return "Senior";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    let updatedData = {
      ...formData,
      [name]: value,
    };

    if (name === "discipline") {
      updatedData.dob = "";
      updatedData.ageGroup = "";
    }

    if (
      name === "dob" &&
      (updatedData.discipline === "Skateboard" ||
        updatedData.discipline === "Roller Freestyle")
    ) {
      updatedData.ageGroup = calculateAgeGroup(value);
    }

    setFormData(updatedData);

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

const handleRegistration = async () => {
  if (loading) return;

  const validationErrors = validateForm(
    formData,
    selectedFile,
    agreed
  );

  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }

  setErrors({});
  setLoading(true);

  try {
    // Create Razorpay Order
    const response = await fetch(
      "http://localhost:5000/api/payment/create-order",
      {
        method: "POST",
      }
    );

    const result = await response.json();

    if (!result.success) {
      alert("Unable to create payment order.");
      return;
    }

    console.log("✅ Razorpay Order:", result.order);
    const options = {
  key: import.meta.env.VITE_RAZORPAY_KEY_ID,

  amount: result.order.amount,

  currency: result.order.currency,

  name: "1st Promotional Open Skating Championship",

  description: "Championship Registration Fee",

  order_id: result.order.id,

handler: async function (response) {
  try {
    console.log("Payment Success");
    console.log(response);

    // Verify payment
    const verifyResponse = await fetch(
      "http://localhost:5000/api/payment/verify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        }),
      }
    );

    const verifyResult = await verifyResponse.json();

    if (!verifyResult.success) {
      alert("Payment Verification Failed");
      return;
    }

    // Save Registration only after successful payment verification
    const registrationResponse = await fetch(
      "http://localhost:5000/api/registration",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          paymentId: response.razorpay_payment_id,
          paymentStatus: "Paid",
        }),
      }
    );

    const registrationResult =
      await registrationResponse.json();

    if (registrationResult.success) {
      alert(
        `Registration Successful!\nRegistration ID: ${registrationResult.registration.registrationId}`
      );
    } else {
      alert(registrationResult.message);
    }
  } catch (error) {
    console.error(error);
    alert("Payment verification failed.");
  }
},

  prefill: {
    name: formData.fullName,

    contact: formData.mobile,
  },

  theme: {
    color: "#2563eb",
  },
};

const razorpay = new window.Razorpay(options);

razorpay.open();

    // Razorpay Checkout will be added in the next step

  } catch (error) {
  console.error("Payment Error:", error);
  alert(error.message);

  } finally {
    setLoading(false);
  }
};

  return (
    <>
      <RegistrationHeader />

      <main className="registration-page">
        <RegistrationHero />

        <ParticipantForm
          formData={formData}
          handleChange={handleChange}
          errors={errors}
        />

        {(formData.discipline === "Inline" ||
          formData.discipline === "Quad") && (
          <RSFIUpload
            formData={formData}
            setFormData={setFormData}
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
            uploading={uploading}
            setUploading={setUploading}
            errors={errors}
            setErrors={setErrors}
          />
        )}

        <PaymentSummary
          handleRegistration={handleRegistration}
          agreed={agreed}
          setAgreed={setAgreed}
          errors={errors}
          setErrors={setErrors}
          loading={loading}
        />
      </main>

      <Footer />
    </>
  );
}