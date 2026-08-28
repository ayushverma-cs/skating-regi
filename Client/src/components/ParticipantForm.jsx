import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;
const REGIONS = ["Agra", "Mathura", "Firozabad", "Mainpuri"];
const ageGroupForDob = (dob) => {
  const year = Number(dob?.slice(0, 4));
  if (year >= 2021 && year <= 2022) return "4-6 Years (2021-2022)";
  if (year >= 2019 && year <= 2020) return "6-8 Years (2019-2020)";
  if (year >= 2017 && year <= 2018) return "8-10 Years (2017-2018)";
  if (year >= 2015 && year <= 2016) return "10-12 Years (2015-2016)";
  if (year >= 2012 && year <= 2014) return "12-15 Years (2012-2014)";
  if (year >= 2009 && year <= 2011) return "15-18 Years (2009-2011)";
  return year && year <= 2008 ? "AB - 18 Years (2008 and Below)" : "";
};

const Field = ({ label, error, children }) => <div className="form-group"><label>{label}</label>{children}{error && <small className="error-text">{error}</small>}</div>;

export default function ParticipantForm({ formData, handleChange, errors, documents, setDocuments, setErrors, onAadhaarDetails }) {
  const [dobNeedsManualEntry, setDobNeedsManualEntry] = useState(false);
  const raceChoices = formData.category === "Adjustable Skate" || formData.category === "Toy Skate" ? ["3 Laps"] : ["5 Laps", "8 Laps"];
  const uploadAadhaar = async (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setErrors((old) => ({ ...old, aadhaarCard: "Maximum file size is 10 MB." })); return; }
    const data = new FormData(); data.append("aadhaarCard", file);
    setDocuments((old) => ({ ...old, aadhaarCardUploading: true }));
    try {
      const response = await fetch(`${API_URL}/api/upload/document`, { method: "POST", body: data });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.success || !result.documentUrl) throw new Error(result.message || "Upload failed. Please try again.");
      setDocuments((old) => ({ ...old, aadhaarCard: result.documentUrl, aadhaarCardName: file.name }));
      setErrors((old) => ({ ...old, aadhaarCard: "" }));
      if (result.dob) {
        onAadhaarDetails(result.dob, result.ageGroup || ageGroupForDob(result.dob));
        setDobNeedsManualEntry(false);
      } else setDobNeedsManualEntry(true);
    } catch (error) {
      setErrors((old) => ({ ...old, aadhaarCard: error instanceof TypeError ? "Could not reach the upload server. Please check your internet connection and try again." : error.message }));
    } finally { setDocuments((old) => ({ ...old, aadhaarCardUploading: false })); }
  };
  return <section className="registration-card">
    <div className="section-kicker">SECTION 1</div><h2>Participant Details</h2>
    <div className="form-grid">
      <Field label="Name (Capital Letters) *" error={errors.fullName}><input name="fullName" value={formData.fullName} onChange={handleChange} placeholder="PARTICIPANT NAME" className={errors.fullName ? "input-error" : ""} /></Field>
      <Field label="Father's Name *" error={errors.fatherName}><input name="fatherName" value={formData.fatherName} onChange={handleChange} placeholder="FATHER'S NAME" className={errors.fatherName ? "input-error" : ""} /></Field>
      <Field label="Aadhaar Card *" error={errors.aadhaarCard}><span className="file-field-name">{documents.aadhaarCardName || "Upload Aadhaar to fetch DOB"}</span><label className="upload-btn" htmlFor="aadhaarCard">{documents.aadhaarCardUploading ? "Uploading and reading DOB..." : documents.aadhaarCard ? "Replace Aadhaar" : "Upload Aadhaar"}</label><input id="aadhaarCard" type="file" accept=".jpg,.jpeg,.png,.pdf" hidden onChange={(event) => uploadAadhaar(event.target.files?.[0])} /></Field>
      <Field label="Date of Birth (DOB) *" error={errors.dob}><input type="date" name="dob" value={formData.dob} readOnly className={errors.dob ? "input-error" : ""} />{dobNeedsManualEntry && <small className="admin-subtext">DOB could not be detected automatically. Please try uploading the Aadhaar again.</small>}</Field>
      <Field label="Age Group *" error={errors.ageGroup}><input name="ageGroup" value={formData.ageGroup} readOnly placeholder="Filled automatically from DOB" className={errors.ageGroup ? "input-error" : ""} /></Field>
      <Field label="Gender *" error={errors.gender}><select name="gender" value={formData.gender} onChange={handleChange} className={errors.gender ? "input-error" : ""}><option value="">Select gender</option><option>Male</option><option>Female</option></select></Field>
      <Field label="Skating Category *" error={errors.category}><select name="category" value={formData.category} onChange={handleChange} className={errors.category ? "input-error" : ""}><option value="">Select skating category</option>{["Adjustable Skate", "Toy Skate", "Quad", "Inline"].map((item) => <option key={item}>{item}</option>)}</select></Field>
      <Field label="Representing Club or School *" error={errors.club}><input name="club" value={formData.club} onChange={handleChange} placeholder="Enter club or school name" className={errors.club ? "input-error" : ""} /></Field>
      <Field label="Coach Name or Teacher Name (optional)" error={errors.coachName}><input name="coachName" value={formData.coachName} onChange={handleChange} placeholder="Enter coach or teacher name" className={errors.coachName ? "input-error" : ""} /></Field>
      <Field label="Contact No. *" error={errors.mobile}><input type="tel" inputMode="numeric" maxLength="10" name="mobile" value={formData.mobile} onChange={handleChange} placeholder="10-digit Indian mobile number" className={errors.mobile ? "input-error" : ""} /></Field>
      <Field label="Representing Agra Region *" error={errors.state}><select name="state" value={formData.state} onChange={handleChange} className={errors.state ? "input-error" : ""}><option value="">Select region</option>{REGIONS.map((item) => <option key={item}>{item}</option>)}</select></Field>
      <Field label="Email Address *" error={errors.email}><input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="name@example.com" autoComplete="email" className={errors.email ? "input-error" : ""} required /></Field>
    </div>
    {formData.category && <div className="race-section"><div className="section-kicker">SECTION 2</div><h3>Race Selection — {formData.category}</h3><p>{raceChoices.length === 1 ? "Select the required race." : "Select both 5 Laps and 8 Laps."}</p><fieldset className={`race-options ${errors.races ? "input-error" : ""}`}><legend>Select Race *</legend>{raceChoices.map((race) => <label key={race}><input type="checkbox" name="races" value={race} checked={formData.races.includes(race)} onChange={handleChange} /> {race}</label>)}</fieldset>{errors.races && <small className="error-text">{errors.races}</small>}</div>}
  </section>;
}
