import { Link, useLocation } from "react-router-dom";
import { CheckCircle2, Printer } from "lucide-react";

const detail = (label, value) => <div className="slip-detail"><span>{label}</span><strong>{value || "—"}</strong></div>;

export default function RegistrationConfirmation() {
  const { state } = useLocation();
  const registration = state?.registration;

  if (!registration) {
    return <main className="confirmation-page empty-confirmation"><h1>Registration slip unavailable</h1><p>Please complete your registration to view the confirmation slip.</p><Link className="intro-register" to="/registration">Go to Registration</Link></main>;
  }

  const events = registration.races?.length ? registration.races.join(", ") : "—";

  return (
    <main className="confirmation-page">
      <section className="confirmation-card" id="registration-slip">
        <header className="slip-header">
          <div><p>ROLLER SPORT ASSOCIATION, MATHURA</p><h1>Registration Confirmed</h1><span>1st Agra Regional Skating Championship – 2026</span></div>
          <CheckCircle2 size={52} aria-label="Registration confirmed" />
        </header>

        <div className="slip-id"><span>REGISTRATION ID</span><strong>{registration.registrationId}</strong></div>
        <h2>Skater Details</h2>
        <div className="slip-grid">
          {detail("Skater Name", registration.fullName)}
          {detail("Age Group", registration.ageGroup)}
          {detail("Category", registration.category)}
          {detail("Selected Race(s)", events)}
        </div>

        <h2>Payment Details</h2>
        <div className="slip-grid payment-grid">
          {detail("Paid Amount", `₹${registration.amountPaid || 500}`)}
          <div className="slip-detail"><span>Payment Status</span><strong className="slip-paid">{registration.paymentStatus}</strong></div>
          {detail("Payment ID", registration.paymentId)}
          {detail("Registration Date", new Date(registration.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }))}
        </div>
        <p className="slip-note">Registration submitted successfully for the 1st Agra Regional Skating Championship – 2026. Please carry this receipt and identification on championship day.</p>
      </section>

      <div className="confirmation-actions no-print">
        <button className="intro-register" onClick={() => window.print()}><Printer size={18} /> Download / Print Registration Slip</button>
        <Link className="confirmation-home" to="/">Back to Home</Link>
      </div>
    </main>
  );
}
