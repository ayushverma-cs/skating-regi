const API_URL = import.meta.env.VITE_API_URL;
const files = [["aadhaarCard", "Aadhaar Card *"], ["dobCertificate", "DOB Certificate *"], ["rsfiCard", "RSFI Registration (optional)"]];

export default function DocumentsUpload({ documents, setDocuments, errors, setErrors }) {
  const upload = async (field, file) => {
    if (!file) return;
    if (file.size > 100 * 1024 * 1024) { setErrors((old) => ({ ...old, [field]: "Maximum file size is 100 MB." })); return; }
    const data = new FormData(); data.append(field, file);
    setDocuments((old) => ({ ...old, [`${field}Uploading`]: true }));
    try { const response = await fetch(`${API_URL}/api/upload/document`, { method: "POST", body: data }); const result = await response.json(); if (!response.ok || !result.success) throw new Error(result.message || "Upload failed."); setDocuments((old) => ({ ...old, [field]: result.documentUrl, [`${field}Name`]: file.name })); setErrors((old) => ({ ...old, [field]: "" })); } catch (error) { setErrors((old) => ({ ...old, [field]: error.message })); } finally { setDocuments((old) => ({ ...old, [`${field}Uploading`]: false })); }
  };
  return <section className="registration-card"><div className="section-kicker">SECTION 3</div><h2>Documents</h2><p className="upload-note">Upload one clear file per document. JPG, PNG and PDF are accepted (maximum 100 MB each).</p><div className="document-grid">{files.map(([field, label]) => <div className={`document-upload ${errors[field] ? "input-error" : ""}`} key={field}><strong>{label}</strong><span>{documents[`${field}Name`] || "No file selected"}</span><label className="upload-btn" htmlFor={field}>{documents[`${field}Uploading`] ? "Uploading..." : documents[field] ? "Replace file" : "Choose file"}</label><input id={field} type="file" accept=".jpg,.jpeg,.png,.pdf" hidden onChange={(event) => upload(field, event.target.files?.[0])} />{errors[field] && <small className="error-text">{errors[field]}</small>}</div>)}</div></section>;
}
