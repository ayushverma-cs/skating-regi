
import Footer from "../components/Footer";

import RegistrationHero from "../components/RegistrationHero";
import ParticipantForm from "../components/ParticipantForm";
import RSFIUpload from "../components/RSFIUpload";
import PaymentSummary from "../components/PaymentSummary";

export default function Registration() {
  return (
    <>
      <Navbar />

      <main className="registration-page">
        <RegistrationHero />
        <ParticipantForm />
        <RSFIUpload />
        <PaymentSummary />
      </main>

      <Footer />
    </>
  );
}