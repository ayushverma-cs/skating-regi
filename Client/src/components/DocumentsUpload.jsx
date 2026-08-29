const API_URL = import.meta.env.VITE_API_URL;
const files = [["candidatePhoto", "Candidate Photo *", ".jpg,.jpeg,.png"], ["dobCertificate", "DOB Certificate *", ".jpg,.jpeg,.png,.pdf"]];

export default function DocumentsUpload({ documents, setDocuments, errors, setErrors }) {
  const upload = async (field, file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setErrors((old) => ({ ...old, [field]: "Maximum file size is 10 MB." })); return; }
    const data = new FormData(); data.append(field, file);
    setDocuments((old) => ({ ...old, [`${field}Uploading`]: true }));
    try { const response = await fetch(`${API_URL}/api/upload/document`, { method: "POST", body: data }); const result = await response.json().catch(() => ({})); if (!response.ok || !result.success || !result.documentUrl) throw new Error(result.message || "Upload failed. Please try again."); setDocuments((old) => ({ ...old, [field]: result.documentUrl, [`${field}Name`]: file.name })); setErrors((old) => ({ ...old, [field]: "" })); } catch (error) { const message = error instanceof TypeError ? "Could not reach the upload server. Please check your internet connection and try again." : error.message; setErrors((old) => ({ ...old, [field]: message })); } finally { setDocuments((old) => ({ ...old, [`${field}Uploading`]: false })); }
  };
  return <section className="registration-card"><div className="section-kicker">SECTION 3</div><h2>Documents</h2><p className="upload-note">Candidate photo: JPG or PNG. DOB certificate: JPG, PNG or PDF. Maximum 10 MB per file.</p><div className="document-grid">{files.map(([field, label, accept]) => <div className={`document-upload ${errors[field] ? "input-error" : ""}`} key={field}><strong>{label}</strong><span>{documents[`${field}Name`] || (field === "dobCertificate" ? "JPG, PNG or PDF" : "JPG or PNG")}</span><label className="upload-btn" htmlFor={field}>{documents[`${field}Uploading`] ? "Uploading..." : documents[field] ? "Replace file" : "Choose file"}</label><input id={field} type="file" accept={accept} hidden onChange={(event) => upload(field, event.target.files?.[0])} />{errors[field] && <small className="error-text">{errors[field]}</small>}</div>)}</div></section>;
}
