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

const API_URL = import.meta.env.VITE_API_URL;
const initialData = { fullName: "", fatherName: "", email: "", dob: "", ageGroup: "", gender: "", category: "", races: [], club: "", coachName: "", mobile: "", state: "" };

export default function Registration() {
  const navigate = useNavigate(); const [formData, setFormData] = useState(initialData); const [documents, setDocuments] = useState({}); const [errors, setErrors] = useState({}); const [agreed, setAgreed] = useState(false); const [loading, setLoading] = useState(false);
  const handleChange = ({ target }) => { const { name, value, checked } = target; let next = { ...formData }; if (name === "category") next = { ...next, category: value, races: [] }; else if (name === "races") next.races = checked ? [...new Set([...next.races, value])] : next.races.filter((race) => race !== value); else next[name] = name === "mobile" ? value.replace(/\D/g, "") : value; setFormData(next); setErrors((old) => ({ ...old, [name]: "" })); };
  const handleAadhaarDetails = (dob, ageGroup) => { setFormData((old) => ({ ...old, dob, ageGroup })); setErrors((old) => ({ ...old, dob: "", ageGroup: "" })); };
  const validate = (requireScreenshot = true) => { const validationErrors = validateForm(formData, documents, agreed); if (!requireScreenshot) delete validationErrors.paymentScreenshot; if (Object.keys(validationErrors).length) { setErrors(validationErrors); document.querySelector(".input-error")?.scrollIntoView({ behavior: "smooth", block: "center" }); return false; } return true; };
  const handleSubmit = async () => { if (!validate()) return; setLoading(true); try { const response = await fetch(`${API_URL}/api/registration`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...formData, ...documents }) }); const result = await response.json(); if (!response.ok || !result.success) throw new Error(result.message || "Unable to submit registration."); navigate("/registration-confirmation", { state: { registration: result.registration } }); } catch (error) { alert(error.message || "Unable to submit registration."); } finally { setLoading(false); } };
  return <><RegistrationHeader /><main className="registration-page"><RegistrationHero /><div className="form-progress" aria-label="Registration progress"><span>1. Details</span><span>2. Race</span><span>3. Documents</span><span>4. Payment</span></div><ParticipantForm formData={formData} handleChange={handleChange} errors={errors} documents={documents} setDocuments={setDocuments} setErrors={setErrors} onAadhaarDetails={handleAadhaarDetails} /><DocumentsUpload documents={documents} setDocuments={setDocuments} errors={errors} setErrors={setErrors} /><section className="registration-card notice-card"><h2>Important Notice</h2><img src={noticeImage} alt="Important championship notice in Hindi" /></section><PaymentSummary onProceed={() => validate(false)} onSubmit={handleSubmit} documents={documents} setDocuments={setDocuments} agreed={agreed} setAgreed={setAgreed} errors={errors} setErrors={setErrors} loading={loading} /></main><Footer /></>;
}
