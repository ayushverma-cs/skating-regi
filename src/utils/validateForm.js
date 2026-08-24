export const validateForm = (
  formData,
  selectedFile,
  agreed
) => {
  const errors = {};

  if (!formData.fullName.trim())
    errors.fullName = "Full Name is required.";

  if (!formData.fatherName.trim())
    errors.fatherName = "Father's Name is required.";

  if (!formData.gender)
    errors.gender = "Please select gender.";

  if (!formData.mobile)
    errors.mobile = "Mobile number is required.";
  else if (!/^[6-9]\d{9}$/.test(formData.mobile))
    errors.mobile = "Enter a valid 10-digit mobile number.";

  if (!formData.discipline)
    errors.discipline = "Please select a discipline.";

  if (
    formData.discipline === "Inline" ||
    formData.discipline === "Quad"
  ) {
    if (!selectedFile)
      errors.rsfi = "Please upload your RSFI Card.";
  }

  if (
    formData.discipline === "Skateboard" ||
    formData.discipline === "Roller Freestyle"
  ) {
    if (!formData.dob)
      errors.dob = "Date of Birth is required.";
  }

  if (!agreed)
    errors.agreed = "Please accept the Rules & Regulations.";

  return errors;
};
