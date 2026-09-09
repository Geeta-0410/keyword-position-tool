const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());


// -------------------------
// Normalize Domain
// -------------------------
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
    const url = new URL(domain);

    return url.hostname
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


// -------------------------
// Get Domain From URL
// -------------------------
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


// -------------------------
// Search API
// -------------------------
app.post("/api/search", async (req, res) => {

  try {

    const { keyword, targetDomain } = req.body;

    if (!keyword || !targetDomain) {
      return res.status(400).json({
        message: "Keyword and targetDomain are required"
      });
    }


    // Target domain normalize
    const normalizedTarget =
      normalizeDomain(targetDomain);


    // Keyword normalize
    const normalizedKeyword =
      keyword.trim().toLowerCase();


    // -------------------------
    // Call SerpAPI
    // -------------------------
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


    // -------------------------
    // Process Results
    // -------------------------
    const results = organicResults.map(
      (result, index) => {

        const domain =
          getDomain(result.link);


        // Check keyword in title
        const titleMatch =
          result.title
            ?.toLowerCase()
            .includes(normalizedKeyword);


        // Check keyword in snippet
        const snippetMatch =
          result.snippet
            ?.toLowerCase()
            .includes(normalizedKeyword);


        // Keyword matching
        const isKeywordMatch =
          titleMatch || snippetMatch;


        // Target website matching
        const isTarget =
          domain === normalizedTarget;


        return {

          position: index + 1,

          title: result.title,

          url: result.link,

          domain,

          snippet: result.snippet || "",

          isTarget,

          isKeywordMatch
        };
      }
    );


    // -------------------------
    // Find Target Website
    // -------------------------
    const targetResult =
      results.find(
        result => result.isTarget
      );


    // -------------------------
    // Find Keyword Matches
    // -------------------------
    const matchingResults =
      results.filter(
        result => result.isKeywordMatch
      );


    // -------------------------
    // Response
    // -------------------------
    res.json({

      keyword,

      position:
        targetResult
          ? targetResult.position
          : null,

      found:
        !!targetResult,

      matchingResults,

      results

    });


  } catch (error) {

    console.error(
      error.response?.data ||
      error.message
    );

    res.status(500).json({
      message:
        "Failed to fetch search results"
    });

  }

});


// -------------------------
// Start Server
// -------------------------
app.listen(
  process.env.PORT || 5000,
  () => {

    console.log(
      `Server running on port ${
        process.env.PORT || 5000
      }`
    );

  }
);