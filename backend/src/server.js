const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const { fetchGoogleSearch } = require("./services/googleSearch");

const { parseGoogleResults } = require("./services/serpParser");

const { detectGoogleBlock } = require("./services/googleGuard");

const searchApi = require("../../api/search");
const extensionPendingApi = require("../../api/extension-pending");
const extensionResultApi = require("../../api/extension-result");
const searchStatusApi = require("../../api/search-status");

const app = express();

app.use(cors());
app.use(express.json());

app.post("/api/search", searchApi);

app.get("/api/extension-pending", extensionPendingApi);

app.post("/api/extension-result", extensionResultApi);

app.get("/api/search-status", searchStatusApi);

app.get("/", (req, res) => {
  res.json({
    message: "Keyword Position Checker API is running",
  });
});

app.get("/test-google", async (req, res) => {
  try {
    const keyword = req.query.q || "best laptops under 50000";

    const result = await fetchGoogleSearch(keyword);

    return res.json({
      status: result.status,
      htmlLength: typeof result.html === "string" ? result.html.length : 0,
    });
  } catch (error) {
    console.error("Google fetch error:", error.message);

    return res.status(500).json({
      message: "Google fetch failed",
      error: error.message,
    });
  }
});

app.get("/test-parser", async (req, res) => {
  try {
    const keyword = req.query.q || "best laptops under 50000";

    const googleResponse = await fetchGoogleSearch(keyword);

    const guardResult = detectGoogleBlock(
      googleResponse.html,
      googleResponse.status,
    );

    if (guardResult.blocked) {
      return res.status(503).json({
        status: googleResponse.status,
        blocked: true,
        reason: guardResult.reason,
        indicator: guardResult.indicator,
      });
    }

    const results = parseGoogleResults(googleResponse.html);

    return res.json({
      status: googleResponse.status,
      blocked: false,
      count: results.length,
      results,
    });
  } catch (error) {
    console.error("Parser error:", error.message);

    return res.status(500).json({
      message: "Parser failed",
      error: error.message,
    });
  }
});

app.get("/debug-google", async (req, res) => {
  try {
    const keyword = req.query.q || "best laptops under 50000";

    const googleResponse = await fetchGoogleSearch(keyword);

    const filePath = path.join(__dirname, "../google-response.html");

    fs.writeFileSync(filePath, googleResponse.html, "utf8");

    console.log("Google HTML saved to:");
    console.log(filePath);

    return res.json({
      status: googleResponse.status,
      htmlLength: googleResponse.html.length,
      file: filePath,
    });
  } catch (error) {
    console.error("Debug Google error:", error.message);

    return res.status(500).json({
      message: "Failed to save Google HTML",
      error: error.message,
    });
  }
});

const PORT = 5000;

console.log("Starting server...");

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
