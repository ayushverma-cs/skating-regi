import logo from "../assets/logo.png";

export default function RegistrationHeader() {
  return (
    <header className="registration-header">

      <div className="header-logo">
        <img src={logo} alt="RSA Logo" />
      </div>

      <div className="header-content">
        <h1>ROLLER SPORT ASSOCIATION, MATHURA</h1>

        <h2>Open Skating Championship 2026</h2>

        <p>Registration Form</p>
      </div>

    </header>
  );
}