import { useNavigate } from "react-router-dom";

export default function Fee() {
  const navigate = useNavigate();

  return (
    <section className="register-section">

      {/* Register Card */}
      <div
        className="register-card"
        onClick={() => navigate("/registration")}
      >
        <div className="register-icon">🏆</div>

        <h2>REGISTER NOW</h2>

       

        <span className="register-arrow">→</span>
      </div>

      {/* Fee Details */}
      <div className="important-card">

        <div className="important-item">
          <span className="icon">💰</span>
          <div>
            <p>Registration Fee</p>
            <h2>₹500 / Participant</h2>
          </div>
        </div>

        <div className="divider"></div>

        <div className="important-item">
          <span className="icon">📅</span>
          <div>
            <p>Last Registration Date</p>
            <h2>10 September 2026</h2>
          </div>
        </div>

      </div>

    </section>
  );
}