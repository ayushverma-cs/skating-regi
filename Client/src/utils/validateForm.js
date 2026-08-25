export const validateForm = (formData, documents, agreed) => {
  const errors = {};
  ["fullName", "dob", "ageGroup", "gender", "category", "club", "coachName", "state"].forEach((field) => { if (!String(formData[field] || "").trim()) errors[field] = "This field is required."; });
  if (!/^[6-9]\d{9}$/.test(formData.mobile || "")) errors.mobile = "Enter a valid 10-digit Indian mobile number.";
  if (formData.races?.length !== 1) errors.races = "Select exactly one race.";
  if (!documents.aadhaarCard) errors.aadhaarCard = "Please upload the Aadhaar card.";
  if (!documents.dobCertificate) errors.dobCertificate = "Please upload the DOB certificate.";
  if (!agreed) errors.agreed = "Please confirm the parent/guardian injury-responsibility declaration.";
  return errors;
};
