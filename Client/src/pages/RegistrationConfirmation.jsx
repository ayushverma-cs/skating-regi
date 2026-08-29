import { Link, useLocation } from "react-router-dom";
import { CheckCircle2, Download } from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import logo from "../assets/logo.png";
import smallBanner from "../assets/UPPER_BANNER.jpg";

const detail = (label, value) => <div className="slip-detail"><span>{label}</span><strong>{value || "—"}</strong></div>;
const formatRegistrationDate = (value) => value ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) : "—";

const downloadReceipt = async (registration) => {
  const receipt = document.getElementById("registration-slip");
  if (!receipt) return;

  const canvas = await html2canvas(receipt, { backgroundColor: "#ffffff", scale: 2, useCORS: true });
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const margin = 10;
  const pageWidth = pdf.internal.pageSize.getWidth() - margin * 2;
  const receiptHeight = (canvas.height * pageWidth) / canvas.width;
  pdf.addImage(canvas.toDataURL("image/png"), "PNG", margin, margin, pageWidth, receiptHeight, undefined, "FAST");
  pdf.save(`registration-receipt-${registration.registrationId || "skater"}.pdf`);
};

export default function RegistrationConfirmation() {
  const { state } = useLocation();
  const registration = state?.registration;
  const apiUrl = import.meta.env.VITE_API_URL || "";

  if (!registration) return <main className="confirmation-page empty-confirmation"><h1>Registration slip unavailable</h1><p>Please complete your registration to view the confirmation slip.</p><Link className="intro-register" to="/registration">Go to Registration</Link></main>;

  const events = registration.races?.length ? registration.races.join(", ") : "—";
  const registrationDate = formatRegistrationDate(registration.createdAt);
  const photoUrl = registration.candidatePhoto ? (/^https?:\/\//i.test(registration.candidatePhoto) ? registration.candidatePhoto : `${apiUrl.replace(/\/$/, "")}${registration.candidatePhoto}`) : "";

  return <main className="confirmation-page">
    <section className="confirmation-card" id="registration-slip">
      <img className="slip-banner" src={smallBanner} alt="Championship banner" />
      <header className="slip-header"><img className="slip-logo" src={logo} alt="Roller Sport Association Mathura" /><div><p>ROLLER SPORT ASSOCIATION, MATHURA</p><h1>Registration Submitted</h1><span>1st Agra Regional Skating Championship – 2026</span></div><CheckCircle2 className="slip-status" size={42} aria-label="Registration submitted" />{photoUrl && <img className="slip-candidate-photo" src={photoUrl} alt={`${registration.fullName} candidate photo`} />}</header>
      <div className="slip-id"><span>REGISTRATION ID</span><strong>{registration.registrationId}</strong></div>
      <h2>Registration Details</h2>
      <div className="slip-grid">{detail("Skater Name", registration.fullName)}{detail("Father's Name", registration.fatherName)}{detail("Date of Birth", registration.dob ? new Date(registration.dob).toLocaleDateString("en-IN") : "—")}{detail("Registration Date", registrationDate)}{detail("Age Group", registration.ageGroup)}{detail("Category", registration.category)}{detail("Selected Race(s)", events)}{detail("Agra Region", registration.state)}</div>
    </section>
    <p className="verification-note no-print">Carry it for verification.</p>
    <div className="confirmation-actions no-print"><button type="button" className="intro-register" onClick={() => downloadReceipt(registration)}><Download size={18} /> Download Receipt PDF</button><Link className="confirmation-home" to="/">Back to Home</Link></div>
  </main>;
}
