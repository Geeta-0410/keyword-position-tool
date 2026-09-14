const { normalizeDomain } = require("../utils/domain");

function calculateRank(results, targetDomain, keyword) {
  const normalizedTarget = normalizeDomain(targetDomain);
  const normalizedKeyword = keyword.trim().toLowerCase();

  const processedResults = results.map((result, index) => {
    const titleMatch = result.title
      ?.toLowerCase()
      .includes(normalizedKeyword);

    const snippetMatch = result.snippet
      ?.toLowerCase()
      .includes(normalizedKeyword);

    const isTarget =
      result.domain === normalizedTarget;

    return {
      ...result,
      position: index + 1,
      isTarget,
      isKeywordMatch: titleMatch || snippetMatch
    };
  });

  const targetResult = processedResults.find(
    (result) => result.isTarget
  );

  const matchingResults = processedResults.filter(
    (result) => result.isKeywordMatch
  );

  return {
    position: targetResult
      ? targetResult.position
      : null,

    found: Boolean(targetResult),

    matchingResults,

    results: processedResults
  };
}

module.exports = {
  calculateRank
};