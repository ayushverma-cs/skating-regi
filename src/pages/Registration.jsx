import { useState } from "react";
import { validateForm } from "../utils/validateForm";
import Footer from "../components/Footer";
import RegistrationHeader from "../components/RegistrationHeader";
import RegistrationHero from "../components/RegistrationHero";
import ParticipantForm from "../components/ParticipantForm";
import DocumentsUpload from "../components/DocumentsUpload";
import PaymentSummary from "../components/PaymentSummary";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const start = {
  rsfiRegistrationNo: "",
  fullName: "",
  dob: "",
  ageGroup: "",
  gender: "",
  category: "",
  races: [],
  club: "",
  coachName: "",
  mobile: "",
  state: ""
};

export default function Registration() {
  const [formData, setFormData] = useState(start);
  const [documents, setDocuments] = useState({});
  const [errors, setErrors] = useState({});
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;

    setFormData((d) =>
      name === "category"
        ? { ...d, category: value, races: [] }
        : name === "races"
        ? {
            ...d,
            races: ["Quad", "Inline"].includes(d.category)
              ? checked
                ? [...d.races, value]
                : d.races.filter((x) => x !== value)
              : [value]
          }
        : {
            ...d,
            [name]: name === "mobile"
              ? value.replace(/\D/g, "")
              : value
          }
    );

    setErrors((x) => ({ ...x, [name]: "" }));
  };

  const register = async () => {
    const issues = validateForm(formData, documents, agreed);

    if (Object.keys(issues).length) {
      return setErrors(issues);
    }

    setLoading(true);

    try {
      // Create Razorpay order
      const r = await fetch(
        `${API_URL}/api/payment/create-order`,
        {
          method: "POST"
        }
      );

      const j = await r.json();

      if (!r.ok || !j.success || !j.order) {
        throw new Error(j.message || "Unable to create a payment order.");
      }

      // Open Razorpay
      if (!window.Razorpay) {
        throw new Error("The payment service could not be loaded. Please refresh and try again.");
      }

      new window.Razorpay({
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: j.order.amount,
        currency: j.order.currency,
        name: "1st Agra Regional Skating Championship",
        order_id: j.order.id,
        prefill: {
          name: formData.fullName,
          contact: formData.mobile
        },

        // Verify payment
        handler: async (p) => {
          const v = await fetch(
            `${API_URL}/api/payment/verify`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                ...p,
                registrationData: {
                  ...formData,
                  ...documents
                }
              })
            }
          );

          const result = await v.json().catch(() => ({}));

          if (!v.ok || !result.success) {
            throw new Error(result.message || "Payment verification failed.");
          }

          alert(
            `Registration submitted successfully for the 1st Agra Regional Skating Championship.\n\nReceipt No: ${result.registration.registrationId}\nPayment ID: ${result.registration.paymentId}`
          );
        }
      }).open();

    } catch (e) {
      alert(e.message || "Unable to start payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <RegistrationHeader />

      <main className="registration-page">
        <RegistrationHero />

        <div className="form-progress">
          <span>1. Details</span>
          <span>2. Race</span>
          <span>3. Documents</span>
          <span>4. Payment</span>
        </div>

        <ParticipantForm
          formData={formData}
          handleChange={handleChange}
          errors={errors}
        />

        <DocumentsUpload
          documents={documents}
          setDocuments={setDocuments}
          errors={errors}
          setErrors={setErrors}
        />

        <PaymentSummary
          handleRegistration={register}
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
