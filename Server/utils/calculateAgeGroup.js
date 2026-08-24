export const calculateAgeGroup = (dob) => {
  const [day, month, year] = dob.split("-");

  const birthDate = new Date(year, month - 1, day);
  const cutoffDate = new Date(process.env.AGE_CUTOFF_DATE);

  console.log("DOB:", birthDate);
  console.log("Cutoff:", cutoffDate);

  let age = cutoffDate.getFullYear() - birthDate.getFullYear();

  const monthDiff = cutoffDate.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && cutoffDate.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  console.log("Calculated Age:", age);

  if (age < 8) return "U-8";
  if (age < 10) return "U-10";
  if (age < 12) return "U-12";
  if (age < 14) return "U-14";
  if (age < 16) return "U-16";
  if (age < 19) return "U-19";

  return "Senior";
};