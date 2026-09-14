const { chromium } = require("playwright");

async function fetchGoogleSearch(keyword) {
  console.log("Launching installed Chrome...");

  const browser = await chromium.launch({
    headless: true,
    executablePath:
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
  });

  try {
    const page = await browser.newPage({
      locale: "en-IN",
      viewport: {
        width: 1366,
        height: 768
      }
    });

    const searchUrl =
      `https://www.google.com/search?q=${encodeURIComponent(keyword)}&num=100&hl=en&gl=in`;

    console.log("Opening:", searchUrl);

    const response = await page.goto(searchUrl, {
      waitUntil: "domcontentloaded",
      timeout: 30000
    });

    await page.waitForTimeout(3000);

    console.log("Status:", response?.status());
    console.log("Title:", await page.title());

    const html = await page.content();

    console.log("HTML length:", html.length);

    return {
      status: response?.status() || 0,
      html
    };
  } finally {
    await browser.close();
    console.log("Browser closed");
  }
}

module.exports = {
  fetchGoogleSearch
};