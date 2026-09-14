function detectGoogleBlock(html, status) {
  if (status === 429) {
    return {
      blocked: true,
      reason: "RATE_LIMITED"
    };
  }

  if (status === 403) {
    return {
      blocked: true,
      reason: "FORBIDDEN"
    };
  }

  if (!html || typeof html !== "string") {
    return {
      blocked: true,
      reason: "EMPTY_RESPONSE"
    };
  }

  const content = html.toLowerCase();

  const indicators = [
    "unusual traffic",
    "our systems have detected unusual traffic",
    "not a robot",
    "captcha",
    "/sorry/",
    "httpservice/retry",
    "trouble accessing google search",
    "sg_rel",
    "challenge"
  ];

  const matchedIndicator = indicators.find(
    (indicator) =>
      content.includes(indicator)
  );

  if (matchedIndicator) {
    console.log(
      "Google block detected:",
      matchedIndicator
    );

    return {
      blocked: true,
      reason: "GOOGLE_CHALLENGE",
      indicator: matchedIndicator
    };
  }

  return {
    blocked: false,
    reason: null,
    indicator: null
  };
}

module.exports = {
  detectGoogleBlock
};