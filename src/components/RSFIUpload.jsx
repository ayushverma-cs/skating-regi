export default function RSFIUpload({
  formData,
  setFormData,
  selectedFile,
  setSelectedFile,
  uploading,
  setUploading,
  errors,
  setErrors,
}) {
  const handleFileChange = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setSelectedFile(file);
    setUploading(true);

    const data = new FormData();
    data.append("rsfiCard", file);

    try {
      const response = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: data,
      });

      const result = await response.json();

      if (result.success) {
        setFormData((prev) => ({
          ...prev,
          dob: result.dob,
          ageGroup: result.ageGroup,
        }));

        // Clear RSFI error immediately
        setErrors((prev) => ({
          ...prev,
          rsfi: "",
        }));
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error(error);
      alert("File upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="registration-card">
      <h2>RSFI Details</h2>

      <p className="upload-note">
        Date of Birth and Age Group will be automatically extracted from your
        RSFI Membership Card.
      </p>

      <div className={`upload-box ${errors.rsfi ? "input-error" : ""}`}>
        <div className="upload-icon">📄</div>

        <h3>Upload RSFI Membership Card</h3>

        <p>Drag & Drop your file here or click below to browse</p>

        <label htmlFor="rsfi-upload" className="upload-btn">
          {uploading ? "Uploading..." : "Choose File"}
        </label>

        <input
          id="rsfi-upload"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          hidden
          onChange={handleFileChange}
        />

        <small>Supported: JPG • PNG • PDF (Max 5 MB)</small>

        {selectedFile && (
          <p style={{ marginTop: "12px", fontWeight: "600" }}>
            ✅ {selectedFile.name}
          </p>
        )}

        {errors.rsfi && (
          <small className="error-text">
            {errors.rsfi}
          </small>
        )}
      </div>

      <div className="auto-info">
        <div className="info-card">
          <span>📅</span>

          <div>
            <strong>Date of Birth</strong>
            <p>{formData.dob || "Waiting for upload..."}</p>
          </div>
        </div>

        <div className="info-card">
          <span>🏆</span>

          <div>
            <strong>Age Group</strong>
            <p>{formData.ageGroup || "Waiting for upload..."}</p>
          </div>
        </div>
      </div>
    </section>
  );
}