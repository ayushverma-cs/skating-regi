export const validateForm = (formData, documents, agreed) => {
  const errors = {};
  ["fullName", "fatherName", "email", "dob", "ageGroup", "gender", "category", "club", "state"].forEach((field) => { if (!String(formData[field] || "").trim()) errors[field] = "This field is required."; });
  if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) errors.email = "Enter a valid email address.";
  if (!/^[6-9]\d{9}$/.test(formData.mobile || "")) errors.mobile = "Enter a valid 10-digit Indian mobile number.";
  const requiresBothRaces = ["Quad", "Inline"].includes(formData.category);
  if ((requiresBothRaces && !(formData.races?.includes("5 Laps") && formData.races?.includes("8 Laps"))) || (!requiresBothRaces && formData.races?.length !== 1)) errors.races = requiresBothRaces ? "Select both 5 Laps and 8 Laps." : "Select the required race.";
  if (!documents.aadhaarCard) errors.aadhaarCard = "Please upload the Aadhaar card.";
  if (!documents.candidatePhoto) errors.candidatePhoto = "Please upload the candidate photo.";
  if (!documents.dobCertificate) errors.dobCertificate = "Please upload the DOB certificate.";
  if (!documents.paymentScreenshot) errors.paymentScreenshot = "Please upload the payment screenshot.";
  if (!agreed) errors.agreed = "Please confirm the parent/guardian injury-responsibility declaration.";
  return errors;
};
