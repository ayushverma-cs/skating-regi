export default function CandidatePhotoUpload({ formData, setFormData, selectedPhoto, setSelectedPhoto, uploading, setUploading, errors, setErrors }) {
  const handlePhotoChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((previous) => ({ ...previous, candidatePhoto: "Please choose a JPG or PNG image." }));
      return;
    }

    setSelectedPhoto(file);
    setUploading(true);
    const data = new FormData();
    data.append("candidatePhoto", file);

    try {
      const response = await fetch("http://localhost:5000/api/upload/candidate-photo", { method: "POST", body: data });
      const result = await response.json();
      if (!result.success) throw new Error(result.message);

      setFormData((previous) => ({ ...previous, candidatePhoto: result.photoUrl }));
      setErrors((previous) => ({ ...previous, candidatePhoto: "" }));
    } catch (error) {
      setSelectedPhoto(null);
      setFormData((previous) => ({ ...previous, candidatePhoto: "" }));
      setErrors((previous) => ({ ...previous, candidatePhoto: error.message || "Photo upload failed." }));
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="registration-card">
      <h2>Candidate Photo</h2>
      <div className={`upload-box ${errors.candidatePhoto ? "input-error" : ""}`}>
        <div className="upload-icon">📷</div>
        <h3>Upload Candidate Photo *</h3>
        <p>Upload a recent, clear passport-style photo.</p>
        <label htmlFor="candidate-photo-upload" className="upload-btn">{uploading ? "Uploading..." : "Choose Photo"}</label>
        <input id="candidate-photo-upload" type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png" hidden onChange={handlePhotoChange} />
        <small>Supported: JPG • PNG (Max 5 MB)</small>
        {selectedPhoto && <p className="upload-success">✓ {selectedPhoto.name}</p>}
        {errors.candidatePhoto && <small className="error-text">{errors.candidatePhoto}</small>}
      </div>
    </section>
  );
}
