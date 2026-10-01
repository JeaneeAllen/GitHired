// Jobs saved by older versions of the app stored the whole Adzuna company object
// as JSON text, e.g. '{"display_name":"The Toro Company",...}'. Return just the name.
export const companyName = (company) => {
  if (!company || !company.startsWith('{')) {
    return company;
  }
  try {
    return JSON.parse(company).display_name || null;
  } catch {
    return company;
  }
};
