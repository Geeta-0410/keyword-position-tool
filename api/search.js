const axios = require("axios");

function normalizeDomain(value) {
  if (!value) return "";

  let domain = value.trim().toLowerCase();

  if (
    !domain.startsWith("http://") &&
    !domain.startsWith("https://")
  ) {
    domain = "https://" + domain;
  }

  try {
    return new URL(domain)
      .hostname
      .replace(/^www\./, "")
      .toLowerCase();
  } catch {
    return value
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split("/")[0]
      .toLowerCase();
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

module.exports = async (req, res) => {

  if (req.method !== "POST") {
    return res.status(405).json({
      message: "Method not allowed"
    });
  }

  try {

    const { keyword, targetDomain } = req.body;

    if (!keyword || !targetDomain) {
      return res.status(400).json({
        message: "Keyword and targetDomain are required"
      });
    }

    const normalizedTarget =
      normalizeDomain(targetDomain);

    const normalizedKeyword =
      keyword.trim().toLowerCase();

    const response = await axios.get(
      "https://serpapi.com/search.json",
      {
        params: {
          engine: "google",
          q: keyword,
          api_key: process.env.SERP_API_KEY,
          num: 100
        }
      }
    );

    const organicResults =
      response.data.organic_results || [];

    const results = organicResults.map(
      (result, index) => {

        const domain = getDomain(result.link);

        const titleMatch =
          result.title
            ?.toLowerCase()
            .includes(normalizedKeyword);

        const snippetMatch =
          result.snippet
            ?.toLowerCase()
            .includes(normalizedKeyword);

        return {
          position: index + 1,
          title: result.title,
          url: result.link,
          domain,
          snippet: result.snippet || "",
          isTarget: domain === normalizedTarget,
          isKeywordMatch:
            titleMatch || snippetMatch
        };
      }
    );

    const targetResult =
      results.find(
        result => result.isTarget
      );

    const matchingResults =
      results.filter(
        result => result.isKeywordMatch
      );

    return res.status(200).json({
      keyword,
      position:
        targetResult
          ? targetResult.position
          : null,
      found: !!targetResult,
      matchingResults,
      results
    });

  } catch (error) {

    console.error(
      error.response?.data ||
      error.message
    );

    return res.status(500).json({
      message: "Failed to fetch search results"
    });
  }
};
