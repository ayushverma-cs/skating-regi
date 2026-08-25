const STATES_AND_UTS = ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"];

const Field = ({ label, error, children }) => <div className="form-group"><label>{label}</label>{children}{error && <small className="error-text">{error}</small>}</div>;

export default function ParticipantForm({ formData, handleChange, errors }) {
  const raceChoices = formData.category === "Adjustable Skate" || formData.category === "Toy Skate" ? ["3 Laps"] : ["5 Laps", "8 Laps"];
  return <section className="registration-card">
    <div className="section-kicker">SECTION 1</div><h2>Participant Details</h2>
    <div className="form-grid">
      <Field label="RSFI Registration No. (optional)" error={errors.rsfiRegistrationNo}><input name="rsfiRegistrationNo" value={formData.rsfiRegistrationNo} onChange={handleChange} placeholder="Enter RSFI registration number" /></Field>
      <Field label="Name (Capital Letters) *" error={errors.fullName}><input name="fullName" value={formData.fullName} onChange={handleChange} placeholder="PARTICIPANT NAME" className={errors.fullName ? "input-error" : ""} /></Field>
      <Field label="Date of Birth (DOB) *" error={errors.dob}><input type="date" name="dob" value={formData.dob} onChange={handleChange} className={errors.dob ? "input-error" : ""} /></Field>
      <Field label="Age Group *" error={errors.ageGroup}><select name="ageGroup" value={formData.ageGroup} onChange={handleChange} className={errors.ageGroup ? "input-error" : ""}><option value="">Select age group</option>{["4–6 Years", "6–8 Years", "8–10 Years", "10–12 Years", "12–15 Years", "15–18 Years", "Above 18 Years"].map((item) => <option key={item}>{item}</option>)}</select></Field>
      <Field label="Gender *" error={errors.gender}><select name="gender" value={formData.gender} onChange={handleChange} className={errors.gender ? "input-error" : ""}><option value="">Select gender</option><option>Male</option><option>Female</option></select></Field>
      <Field label="Skating Category *" error={errors.category}><select name="category" value={formData.category} onChange={handleChange} className={errors.category ? "input-error" : ""}><option value="">Select skating category</option>{["Adjustable Skate", "Toy Skate", "Quad", "Inline"].map((item) => <option key={item}>{item}</option>)}</select></Field>
      <Field label="Representing Club *" error={errors.club}><input name="club" value={formData.club} onChange={handleChange} placeholder="Enter club name" className={errors.club ? "input-error" : ""} /></Field>
      <Field label="Coach Name *" error={errors.coachName}><input name="coachName" value={formData.coachName} onChange={handleChange} placeholder="Enter coach name" className={errors.coachName ? "input-error" : ""} /></Field>
      <Field label="Contact No. *" error={errors.mobile}><input type="tel" inputMode="numeric" maxLength="10" name="mobile" value={formData.mobile} onChange={handleChange} placeholder="10-digit Indian mobile number" className={errors.mobile ? "input-error" : ""} /></Field>
      <Field label="Representing State *" error={errors.state}><select name="state" value={formData.state} onChange={handleChange} className={errors.state ? "input-error" : ""}><option value="">Select state / union territory</option>{STATES_AND_UTS.map((item) => <option key={item}>{item}</option>)}</select></Field>
    </div>
    {formData.category && <div className="race-section"><div className="section-kicker">SECTION 2</div><h3>Race Selection — {formData.category}</h3><p>Select one race for this category only.</p><fieldset className={`race-options ${errors.races ? "input-error" : ""}`}><legend>Select Race *</legend>{raceChoices.map((race) => <label key={race}><input type="radio" name="races" value={race} checked={formData.races.includes(race)} onChange={handleChange} /> {race}</label>)}</fieldset>{errors.races && <small className="error-text">{errors.races}</small>}</div>}
  </section>;
}
