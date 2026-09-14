function normalizeDomain(value) {
  if (!value) {
    return "";
  }

  let domain = value.trim().toLowerCase();

  if (
    !domain.startsWith("http://") &&
    !domain.startsWith("https://")
  ) {
    domain = `https://${domain}`;
  }

  try {
    return new URL(domain)
      .hostname
      .replace(/^www\./, "")
      .toLowerCase();
  } catch {
    return value
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split("/")[0];
  }
}

function getDomain(url) {
  try {
    return new URL(url)
      .hostname
      .replace(/^www\./, "")
      .toLowerCase();
  } catch {
    return "";
  }
}

module.exports = {
  normalizeDomain,
  getDomain
};