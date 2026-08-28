import { Link, useLocation } from "react-router-dom";
import { CheckCircle2, Download } from "lucide-react";
import logo from "../assets/logo.png";
import smallBanner from "../assets/UPPER_BANNER.jpg";

const detail = (label, value) => <div className="slip-detail"><span>{label}</span><strong>{value || "—"}</strong></div>;

export default function RegistrationConfirmation() {
  const { state } = useLocation();
  const registration = state?.registration;
  if (!registration) return <main className="confirmation-page empty-confirmation"><h1>Registration slip unavailable</h1><p>Please complete your registration to view the confirmation slip.</p><Link className="intro-register" to="/registration">Go to Registration</Link></main>;

  const events = registration.races?.length ? registration.races.join(", ") : "—";
  const registrationDate = registration.createdAt ? new Date(registration.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) : "—";

  return <main className="confirmation-page">
    <section className="confirmation-card" id="registration-slip">
      <img className="slip-banner" src={smallBanner} alt="Championship banner" />
      <header className="slip-header"><img className="slip-logo" src={logo} alt="Roller Sport Association Mathura" /><div><p>ROLLER SPORT ASSOCIATION, MATHURA</p><h1>Registration Submitted</h1><span>1st Agra Regional Skating Championship – 2026</span></div><CheckCircle2 size={52} aria-label="Registration submitted" /></header>
      <div className="slip-id"><span>REGISTRATION ID</span><strong>{registration.registrationId}</strong></div>
      <h2>Skater Details</h2>
      <div className="slip-grid">{detail("Skater Name", registration.fullName)}{detail("Father's Name", registration.fatherName)}{detail("Date of Birth", registration.dob ? new Date(registration.dob).toLocaleDateString("en-IN") : "—")}{detail("Age Group", registration.ageGroup)}{detail("Category", registration.category)}{detail("Selected Race(s)", events)}{detail("Agra Region", registration.state)}</div>
      <h2>Payment Details</h2>
      <div className="slip-grid payment-grid">{detail("Amount Submitted", `₹${registration.amountPaid || 500}`)}{detail("Registration Date", registrationDate)}</div>
      <p className="slip-note">Carry it for verification.</p>
    </section>
    <div className="confirmation-actions no-print"><button className="intro-register" onClick={() => window.print()}><Download size={18} /> Download Receipt</button><Link className="confirmation-home" to="/">Back to Home</Link></div>
  </main>;
}
