export default function ParticipantForm({
  formData,
  handleChange,
  errors,
}) {
  return (
    <section className="registration-card">
      <h2>Participant Information</h2>

      <div className="form-grid">

        {/* Full Name */}
        <div className="form-group">
          <label>Full Name *</label>

          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Enter your full name"
            className={errors.fullName ? "input-error" : ""}
          />

          {errors.fullName && (
            <small className="error-text">
              {errors.fullName}
            </small>
          )}
        </div>

        {/* Father's Name */}
        <div className="form-group">
          <label>Father's Name *</label>

          <input
            type="text"
            name="fatherName"
            value={formData.fatherName}
            onChange={handleChange}
            placeholder="Enter father's name"
            className={errors.fatherName ? "input-error" : ""}
          />

          {errors.fatherName && (
            <small className="error-text">
              {errors.fatherName}
            </small>
          )}
        </div>

        {/* Gender */}
        <div className="form-group">
          <label>Gender *</label>

          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className={errors.gender ? "input-error" : ""}
          >
            <option value="" disabled hidden>
              Select Gender
            </option>

            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          {errors.gender && (
            <small className="error-text">
              {errors.gender}
            </small>
          )}
        </div>

        {/* Mobile */}
        <div className="form-group">
          <label>Mobile Number *</label>

          <input
            type="tel"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            placeholder="9876543210"
            className={errors.mobile ? "input-error" : ""}
          />

          {errors.mobile && (
            <small className="error-text">
              {errors.mobile}
            </small>
          )}
        </div>

        {/* Discipline */}
        <div className="form-group">
          <label>Discipline *</label>

          <select
            name="discipline"
            value={formData.discipline}
            onChange={handleChange}
            className={errors.discipline ? "input-error" : ""}
          >
            <option value="" disabled hidden>
              Select Discipline
            </option>

            <option value="Inline">Inline</option>
            <option value="Quad">Quad</option>
            <option value="Skateboard">Skateboard</option>
            <option value="Roller Freestyle">
              Roller Freestyle
            </option>
          </select>

          {errors.discipline && (
            <small className="error-text">
              {errors.discipline}
            </small>
          )}
        </div>

        {/* DOB */}
        {(formData.discipline === "Skateboard" ||
          formData.discipline === "Roller Freestyle") && (
          <div className="form-group">
            <label>Date of Birth *</label>

            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              className={errors.dob ? "input-error" : ""}
            />

            {errors.dob && (
              <small className="error-text">
                {errors.dob}
              </small>
            )}
          </div>
        )}

        {/* Age Group */}
        {(formData.discipline === "Skateboard" ||
          formData.discipline === "Roller Freestyle") && (
          <div className="form-group">
            <label>Age Group</label>

            <input
              type="text"
              value={formData.ageGroup}
              readOnly
              placeholder="Auto Assigned"
            />
          </div>
        )}

      </div>
    </section>
  );
}