import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { validateForm } from "../utils/validateForm";
import Footer from "../components/Footer";
import RegistrationHeader from "../components/RegistrationHeader";
import RegistrationHero from "../components/RegistrationHero";
import ParticipantForm from "../components/ParticipantForm";
import DocumentsUpload from "../components/DocumentsUpload";
import PaymentSummary from "../components/PaymentSummary";

const initialData = { rsfiRegistrationNo: "", fullName: "", dob: "", ageGroup: "", gender: "", category: "", races: [], club: "", coachName: "", mobile: "", state: "" };

export default function Registration() {
  const navigate = useNavigate(); const [formData, setFormData] = useState(initialData); const [documents, setDocuments] = useState({}); const [errors, setErrors] = useState({}); const [agreed, setAgreed] = useState(false); const [loading, setLoading] = useState(false);
  const handleChange = ({ target }) => {
    const { name, value, checked } = target; let next = { ...formData };
    if (name === "category") next = { ...next, category: value, races: [] };
    else if (name === "races") next.races = checked ? [value] : [];
    else next[name] = name === "mobile" ? value.replace(/\D/g, "") : value;
    setFormData(next); setErrors((old) => ({ ...old, [name]: "" }));
  };
  const handleRegistration = async () => {
    const validationErrors = validateForm(formData, documents, agreed); if (Object.keys(validationErrors).length) { setErrors(validationErrors); document.querySelector(".input-error")?.scrollIntoView({ behavior: "smooth", block: "center" }); return; }
    setLoading(true);
    try {
      const orderResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/create-order`, { method: "POST" }); const orderResult = await orderResponse.json(); if (!orderResult.success) throw new Error(orderResult.message || "Unable to create payment order.");
      const razorpay = new window.Razorpay({ key: import.meta.env.VITE_RAZORPAY_KEY_ID, amount: orderResult.order.amount, currency: orderResult.order.currency, name: "1st Agra Regional Skating Championship", description: "Championship registration fee", order_id: orderResult.order.id, prefill: { name: formData.fullName, contact: formData.mobile }, theme: { color: "#eab308" }, handler: async (payment) => {
        const verifyResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/verify`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payment, registrationData: { ...formData, ...documents } }) }); const verified = await verifyResponse.json(); if (!verifyResponse.ok || !verified.success) throw new Error(verified.message || "Payment verification failed."); navigate("/registration-confirmation", { state: { registration: verified.registration } });
      } }); razorpay.open();
    } catch (error) { alert(error.message || "Unable to start payment."); } finally { setLoading(false); }
  };
  return <><RegistrationHeader /><main className="registration-page"><RegistrationHero /><div className="form-progress" aria-label="Registration progress"><span>1. Details</span><span>2. Race</span><span>3. Documents</span><span>4. Payment</span></div><ParticipantForm formData={formData} handleChange={handleChange} errors={errors} /><DocumentsUpload documents={documents} setDocuments={setDocuments} errors={errors} setErrors={setErrors} /><PaymentSummary handleRegistration={handleRegistration} agreed={agreed} setAgreed={setAgreed} errors={errors} setErrors={setErrors} loading={loading} /></main><Footer /></>;
}
