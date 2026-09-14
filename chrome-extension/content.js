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

function normalizeDomain(value) {
  if (!value) {
    return "";
  }

  let domain = value
    .trim()
    .toLowerCase();

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
    return domain
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split("/")[0];
  }
}

function extractSearchResults() {
  const results = [];
  const seenUrls = new Set();

  /*
   * Google organic results currently use
   * .yuRUbf for the result title/link area.
   *
   * This prevents AI Overview, Videos and other
   * non-organic h3 elements from being counted.
   */
  const titleElements =
    document.querySelectorAll(".yuRUbf h3");

  console.log(
    "Organic h3 elements found:",
    titleElements.length
  );

  titleElements.forEach((titleElement) => {
    const title =
      titleElement.textContent?.trim();

    if (!title) return;

    const linkElement =
      titleElement.closest("a");

    if (!linkElement) return;

    const href =
      linkElement.href;

    if (!href) return;

    if (
      !href.startsWith("http://") &&
      !href.startsWith("https://")
    ) {
      return;
    }

    const domain = getDomain(href);

    if (!domain) return;

    /*
     * Never count Google internal results.
     */
    if (
      domain === "google.com" ||
      domain.endsWith(".google.com")
    ) {
      return;
    }

    /*
     * Avoid duplicate URLs.
     */
    if (seenUrls.has(href)) {
      return;
    }

    seenUrls.add(href);

    /*
     * Find the complete organic result container.
     */
    const container =
      titleElement.closest("div.MjjYud");

    let snippet = "";

    if (container) {
      const snippetElement =
        container.querySelector(
          ".VwiC3b, .yXK7lf, [data-sncf]"
        );

      if (snippetElement) {
        snippet =
          snippetElement.textContent?.trim() || "";
      }
    }

    results.push({
      position: results.length + 1,
      title,
      url: href,
      domain,
      snippet
    });
  });

  return results;
}

function calculateRank(
  results,
  keyword,
  targetDomain
) {
  const normalizedTarget =
    normalizeDomain(targetDomain);

  const normalizedKeyword =
    keyword
      .trim()
      .toLowerCase();

  /*
   * Convert keyword into individual words.
   *
   * Example:
   * "best laptops under 50000"
   *
   * becomes:
   * ["best", "laptops", "under", "50000"]
   */
  const keywordWords =
    normalizedKeyword
      .split(/\s+/)
      .filter(Boolean);

  const processedResults =
    results.map((result, index) => {
      const title =
        result.title?.toLowerCase() || "";

      const snippet =
        result.snippet?.toLowerCase() || "";

      const searchableText =
        `${title} ${snippet}`;

      const isTarget =
        result.domain === normalizedTarget;

      /*
       * Count how many keyword words
       * appear in title/snippet.
       */
      const matchedWords =
        keywordWords.filter((word) =>
          searchableText.includes(word)
        );

      /*
       * Consider it a keyword match when
       * most/all meaningful words are present.
       */
      const isKeywordMatch =
        keywordWords.length > 0 &&
        matchedWords.length >=
          Math.ceil(keywordWords.length * 0.75);

      return {
        ...result,

        position: index + 1,

        isTarget,

        isKeywordMatch,

        matchedWords
      };
    });

  const targetResult =
    processedResults.find(
      (result) => result.isTarget
    );

  const matchingResults =
    processedResults.filter(
      (result) => result.isKeywordMatch
    );

  return {
    position:
      targetResult
        ? targetResult.position
        : null,

    found:
      Boolean(targetResult),

    matchingResults,

    results: processedResults
  };
}

/*
 * Test parser.
 */
const results = extractSearchResults();

console.log("=================================");
console.log("Keyword Position Checker");
console.log(
  "Organic results found:",
  results.length
);
console.log(results);
console.log("=================================");

/*
 * Listen for requests from popup.
 */
chrome.runtime.onMessage.addListener(
  (message, sender, sendResponse) => {
    if (message?.type === "GET_SERP_RESULTS") {
      const results =
        extractSearchResults();

      sendResponse({
        success: true,
        results
      });
    }

    return true;
  }
);

const testKeyword =
  "best laptops under 50000";

const testTarget =
  "asus.com";

const serpResults =
  extractSearchResults();

const ranking =
  calculateRank(
    serpResults,
    testKeyword,
    testTarget
  );

console.log(
  "================================="
);

console.log(
  "KEYWORD:",
  testKeyword
);

console.log(
  "TARGET:",
  testTarget
);

console.log(
  "POSITION:",
  ranking.position
);

console.log(
  "FOUND:",
  ranking.found
);

console.log(
  "MATCHING RESULTS:",
  ranking.matchingResults
);

console.log(
  "ALL RESULTS:",
  ranking.results
);

console.log(
  "================================="
);