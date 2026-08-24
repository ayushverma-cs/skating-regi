export default function PaymentSummary({
  handleRegistration,
  agreed,
  setAgreed,
  errors,
  setErrors,
  loading,
}) {
  return (
    <section className="registration-card">
      <h2>Payment Summary</h2>

      <div className="payment-row">
        <span>Registration Fee</span>
        <strong>₹500</strong>
      </div>

      <hr />

      <div className="payment-row total">
        <span>Total Amount</span>
        <strong>₹500</strong>
      </div>

      <label className="agree">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => {
            setAgreed(e.target.checked);

            if (e.target.checked) {
              setErrors((prev) => ({
                ...prev,
                agreed: "",
              }));
            }
          }}
        />

        I agree to the Championship Rules & Regulations.
      </label>

      {errors.agreed && (
        <small className="error-text">
          {errors.agreed}
        </small>
      )}

      <button
        className="payment-btn"
        onClick={handleRegistration}
        disabled={loading}
      >
        {loading
          ? "Please Wait..."
          : "Proceed to Payment"}
      </button>
    </section>
  );
}