import { Link, useLocation } from "react-router-dom";
import { CheckCircle2, Download } from "lucide-react";
import logo from "../assets/logo.png";
import smallBanner from "../assets/UPPER_BANNER.jpg";

const detail = (label, value) => <div className="slip-detail"><span>{label}</span><strong>{value || "—"}</strong></div>;
const escapeHtml = (value) => String(value ?? "—").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));

const downloadReceipt = (registration, photoUrl) => {
  const rows = [
    ["Registration ID", registration.registrationId], ["Skater Name", registration.fullName], ["Father's Name", registration.fatherName],
    ["Date of Birth", registration.dob ? new Date(registration.dob).toLocaleDateString("en-IN") : "—"], ["Age Group", registration.ageGroup],
    ["Category", registration.category], ["Selected Race(s)", registration.races?.join(", ") || "—"], ["Agra Region", registration.state],
    ["Amount Submitted", `₹${registration.amountPaid || 500}`],
  ];
  const photo = photoUrl ? `<img class="photo" src="${escapeHtml(photoUrl)}" alt="Candidate photo">` : "";
  const documentHtml = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Registration Receipt</title><style>body{margin:0;padding:32px;background:#f1f5f9;font-family:Arial,sans-serif;color:#0f172a}.receipt{max-width:760px;margin:auto;background:#fff;border:1px solid #cbd5e1;border-radius:16px;overflow:hidden}.header{position:relative;padding:28px 150px 28px 28px;background:#0f172a;color:#fff}.header p{margin:0 0 8px;color:#facc15;font-size:12px;font-weight:bold;letter-spacing:1px}.header h1{margin:0;font-size:28px}.photo{position:absolute;right:28px;top:20px;width:78px;height:94px;object-fit:cover;border:3px solid #facc15;border-radius:8px}.content{padding:28px}.id{padding:14px;border:1px dashed #d4a70b;border-radius:9px;background:#fffbeb;font-weight:bold}.id span{display:block;color:#64748b;font-size:11px;margin-bottom:4px}h2{font-size:16px;margin:26px 0 10px}.grid{display:grid;grid-template-columns:1fr 1fr;border-top:1px solid #e2e8f0;border-left:1px solid #e2e8f0}.field{padding:13px;border-right:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0}.field span{display:block;color:#64748b;font-size:11px;font-weight:bold;letter-spacing:.5px}.field strong{display:block;margin-top:6px;font-size:14px}@media print{body{padding:0;background:#fff}.receipt{border:0}}</style></head><body><article class="receipt"><header class="header"><p>ROLLER SPORT ASSOCIATION, MATHURA</p><h1>Registration Submitted</h1><div>1st Agra Regional Skating Championship – 2026</div>${photo}</header><main class="content"><div class="id"><span>REGISTRATION ID</span>${escapeHtml(registration.registrationId)}</div><h2>Registration Details</h2><section class="grid">${rows.map(([label, value]) => `<div class="field"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join("")}</section></main></article></body></html>`;
  const url = URL.createObjectURL(new Blob([documentHtml], { type: "text/html;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `registration-receipt-${registration.registrationId || "skater"}.html`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export default function RegistrationConfirmation() {
  const { state } = useLocation();
  const registration = state?.registration;
  const apiUrl = import.meta.env.VITE_API_URL || "";
  if (!registration) return <main className="confirmation-page empty-confirmation"><h1>Registration slip unavailable</h1><p>Please complete your registration to view the confirmation slip.</p><Link className="intro-register" to="/registration">Go to Registration</Link></main>;

  const events = registration.races?.length ? registration.races.join(", ") : "—";
  const registrationDate = registration.createdAt ? new Date(registration.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) : "—";
  const photoUrl = registration.candidatePhoto ? (/^https?:\/\//i.test(registration.candidatePhoto) ? registration.candidatePhoto : `${apiUrl.replace(/\/$/, "")}${registration.candidatePhoto}`) : "";

  return <main className="confirmation-page">
    <section className="confirmation-card" id="registration-slip">
      <img className="slip-banner" src={smallBanner} alt="Championship banner" />
      <header className="slip-header"><img className="slip-logo" src={logo} alt="Roller Sport Association Mathura" /><div><p>ROLLER SPORT ASSOCIATION, MATHURA</p><h1>Registration Submitted</h1><span>1st Agra Regional Skating Championship – 2026</span></div><CheckCircle2 className="slip-status" size={42} aria-label="Registration submitted" />{photoUrl && <img className="slip-candidate-photo" src={photoUrl} alt={`${registration.fullName} candidate photo`} />}</header>
      <div className="slip-id"><span>REGISTRATION ID</span><strong>{registration.registrationId}</strong></div>
      <h2>Skater Details</h2>
      <div className="slip-grid">{detail("Skater Name", registration.fullName)}{detail("Father's Name", registration.fatherName)}{detail("Date of Birth", registration.dob ? new Date(registration.dob).toLocaleDateString("en-IN") : "—")}{detail("Age Group", registration.ageGroup)}{detail("Category", registration.category)}{detail("Selected Race(s)", events)}{detail("Agra Region", registration.state)}</div>
      <h2>Payment Details</h2>
      <div className="slip-grid payment-grid">{detail("Amount Submitted", `₹${registration.amountPaid || 500}`)}{detail("Registration Date", registrationDate)}</div>
    </section>
    <p className="verification-note no-print">Carry it for verification.</p>
    <div className="confirmation-actions no-print"><button type="button" className="intro-register" onClick={() => downloadReceipt(registration, photoUrl)}><Download size={18} /> Download Receipt</button><Link className="confirmation-home" to="/">Back to Home</Link></div>
  </main>;
}
