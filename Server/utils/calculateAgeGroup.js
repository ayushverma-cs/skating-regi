export const calculateAgeGroup = (dob) => {
  const year = Number(String(dob).slice(0, 4));
  if (!Number.isInteger(year)) return "";
  if (year >= 2021 && year <= 2022) return "4-6 Years (2021-2022)";
  if (year >= 2019 && year <= 2020) return "6-8 Years (2019-2020)";
  if (year >= 2017 && year <= 2018) return "8-10 Years (2017-2018)";
  if (year >= 2015 && year <= 2016) return "10-12 Years (2015-2016)";
  if (year >= 2012 && year <= 2014) return "12-15 Years (2012-2014)";
  if (year >= 2009 && year <= 2011) return "15-18 Years (2009-2011)";
  if (year <= 2008) return "AB - 18 Years (2008 and Below)";
  return "";
};
