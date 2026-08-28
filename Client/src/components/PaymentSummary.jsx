import { useState } from "react";
import qrCode from "../assets/QR.png";

const API_URL = import.meta.env.VITE_API_URL;

export default function PaymentSummary({ onProceed, onSubmit, documents, setDocuments, agreed, setAgreed, errors, setErrors, loading }) {
  const [showQr, setShowQr] = useState(false);

  const uploadScreenshot = async (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setErrors((old) => ({ ...old, paymentScreenshot: "Maximum file size is 10 MB." }));
      return;
    }

    const data = new FormData();
    data.append("paymentScreenshot", file);
    setDocuments((old) => ({ ...old, paymentScreenshotUploading: true }));
    try {
      const response = await fetch(`${API_URL}/api/upload/payment-screenshot`, { method: "POST", body: data });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.success || !result.documentUrl) throw new Error(response.status === 404 ? "Payment screenshot upload is not available yet. Please deploy the latest Server changes." : result.message || "Screenshot upload failed.");
      setDocuments((old) => ({ ...old, paymentScreenshot: result.documentUrl, paymentScreenshotName: file.name }));
      setErrors((old) => ({ ...old, paymentScreenshot: "" }));
    } catch (error) {
      setErrors((old) => ({ ...old, paymentScreenshot: error.message || "Screenshot upload failed." }));
    } finally {
      setDocuments((old) => ({ ...old, paymentScreenshotUploading: false }));
    }
  };

  const proceed = () => { if (onProceed()) setShowQr(true); };

  return <section className="registration-card payment-card">
    <div className="section-kicker">SECTION 4</div>
    <h2>Payment &amp; Confirmation</h2>
    <p className="upload-note">Registration fee is non-refundable. Scan the QR code and pay ₹500.</p>
    <div className="payment-row"><span>Registration Fee <small>(Non-refundable)</small></span><strong>₹500</strong></div>
    <hr />
    <div className="payment-row total"><span>Total Amount</span><strong>₹500</strong></div>
    <label className={`injury-declaration ${errors.agreed ? "input-error" : ""}`}><input type="checkbox" checked={agreed} onChange={(event) => { setAgreed(event.target.checked); if (event.target.checked) setErrors((old) => ({ ...old, agreed: "" })); }} /><span><strong>Parent/Guardian Declaration *</strong>I confirm that if any injury occurs during the Championship, the participant’s parent or guardian will be responsible.</span></label>
    {errors.agreed && <small className="error-text">{errors.agreed}</small>}
    {!showQr ? <button className="payment-btn" type="button" onClick={proceed}>Proceed to QR Payment</button> : <div className="qr-payment">
      <h3>Scan to pay ₹500</h3>
      <img src={qrCode} alt="QR code for championship registration payment" />
      <p>After payment, upload a clear screenshot below.</p>
      <div className={`payment-proof-upload ${errors.paymentScreenshot ? "input-error" : ""}`}>
        <strong>Payment Screenshot *</strong>
        <span>{documents.paymentScreenshotName || "No screenshot selected"}</span>
        <label className="upload-btn" htmlFor="payment-screenshot">{documents.paymentScreenshotUploading ? "Uploading screenshot..." : documents.paymentScreenshot ? "Replace screenshot" : "Upload screenshot"}</label>
        <input id="payment-screenshot" type="file" accept=".jpg,.jpeg,.png" hidden onChange={(event) => uploadScreenshot(event.target.files?.[0])} />
        {errors.paymentScreenshot && <small className="error-text">{errors.paymentScreenshot}</small>}
      </div>
      <button className="payment-btn" type="button" onClick={onSubmit} disabled={loading || documents.paymentScreenshotUploading}>{loading ? "Submitting..." : "Submit Registration"}</button>
    </div>}
  </section>;
}
