import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { validateForm } from "../utils/validateForm";
import Footer from "../components/Footer";
import RegistrationHeader from "../components/RegistrationHeader";
import RegistrationHero from "../components/RegistrationHero";
import ParticipantForm from "../components/ParticipantForm";
import DocumentsUpload from "../components/DocumentsUpload";
import PaymentSummary from "../components/PaymentSummary";
import noticeImage from "../assets/notice.jpeg";

const initialData = { fullName: "", fatherName: "", email: "", dob: "", ageGroup: "", gender: "", category: "", races: [], club: "", coachName: "", mobile: "", state: "" };
const ageGroupForDob = (dob) => {
  const year = Number(dob?.slice(0, 4));
  if (year >= 2021 && year <= 2022) return "4-6 Years (2021-2022)";
  if (year >= 2019 && year <= 2020) return "6-8 Years (2019-2020)";
  if (year >= 2017 && year <= 2018) return "8-10 Years (2017-2018)";
  if (year >= 2015 && year <= 2016) return "10-12 Years (2015-2016)";
  if (year >= 2012 && year <= 2014) return "12-15 Years (2012-2014)";
  if (year >= 2009 && year <= 2011) return "15-18 Years (2009-2011)";
  return year && year <= 2008 ? "AB - 18 Years (2008 and Below)" : "";
};

export default function Registration() {
  const navigate = useNavigate(); const [formData, setFormData] = useState(initialData); const [documents, setDocuments] = useState({}); const [errors, setErrors] = useState({}); const [agreed, setAgreed] = useState(false); const [loading, setLoading] = useState(false);
  const handleChange = ({ target }) => {
    const { name, value, checked } = target; let next = { ...formData };
    if (name === "category") next = { ...next, category: value, races: [] };
    else if (name === "races") next.races = checked ? [...new Set([...next.races, value])] : next.races.filter((race) => race !== value);
    else { next[name] = name === "mobile" ? value.replace(/\D/g, "") : value; if (name === "dob") next.ageGroup = ageGroupForDob(value); }
    setFormData(next); setErrors((old) => ({ ...old, [name]: "" }));
  };
  const handleAadhaarDetails = (dob, ageGroup) => {
    if (!dob) return;
    setFormData((old) => ({ ...old, dob, ageGroup }));
    setErrors((old) => ({ ...old, dob: "", ageGroup: "" }));
  };
  const handleRegistration = async () => {
    const validationErrors = validateForm(formData, documents, agreed); if (Object.keys(validationErrors).length) { setErrors(validationErrors); document.querySelector(".input-error")?.scrollIntoView({ behavior: "smooth", block: "center" }); return; }
    setLoading(true);
    try {
      const orderResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/create-order`, { method: "POST" }); const orderResult = await orderResponse.json(); if (!orderResult.success) throw new Error(orderResult.message || "Unable to create payment order.");
      const razorpay = new window.Razorpay({ key: import.meta.env.VITE_RAZORPAY_KEY_ID, amount: orderResult.order.amount, currency: orderResult.order.currency, name: "1st Agra Regional Skating Championship", description: "Championship registration fee", order_id: orderResult.order.id, prefill: { name: formData.fullName, email: formData.email, contact: formData.mobile }, theme: { color: "#eab308" }, handler: async (payment) => {
        const verifyResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/verify`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payment, registrationData: { ...formData, ...documents } }) }); const verified = await verifyResponse.json(); if (!verifyResponse.ok || !verified.success) throw new Error(verified.message || "Payment verification failed."); navigate("/registration-confirmation", { state: { registration: verified.registration } });
      } }); razorpay.open();
    } catch (error) { alert(error.message || "Unable to start payment."); } finally { setLoading(false); }
  };
  return <><RegistrationHeader /><main className="registration-page"><RegistrationHero /><div className="form-progress" aria-label="Registration progress"><span>1. Details</span><span>2. Race</span><span>3. Documents</span><span>4. Payment</span></div><ParticipantForm formData={formData} handleChange={handleChange} errors={errors} documents={documents} setDocuments={setDocuments} setErrors={setErrors} onAadhaarDetails={handleAadhaarDetails} /><DocumentsUpload documents={documents} setDocuments={setDocuments} errors={errors} setErrors={setErrors} /><section className="registration-card notice-card"><h2>Important Notice</h2><img src={noticeImage} alt="Important championship notice in Hindi" /></section><PaymentSummary handleRegistration={handleRegistration} agreed={agreed} setAgreed={setAgreed} errors={errors} setErrors={setErrors} loading={loading} /></main><Footer /></>;
}
