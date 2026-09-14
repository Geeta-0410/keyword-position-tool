const cheerio = require("cheerio");
const { getDomain } = require("../utils/domain");

function parseGoogleResults(html) {
  const $ = cheerio.load(html);

  const results = [];

  /*
   * Google commonly wraps organic results inside:
   * div.MjjYud
   *
   * But Google HTML changes frequently, so we use
   * multiple fallback approaches.
   */

  const containers = $("div.MjjYud");

  containers.each((index, element) => {
    const container = $(element);

    const titleElement = container.find("h3").first();

    if (!titleElement.length) {
      return;
    }

    const title = titleElement.text().trim();

    if (!title) {
      return;
    }

    const linkElement = titleElement.closest("a");

    let href = linkElement.attr("href");

    if (!href) {
      href = container.find("a[href]").first().attr("href");
    }

    if (!href) {
      return;
    }

    /*
     * Ignore Google's internal links.
     */
    if (
      !href.startsWith("http://") &&
      !href.startsWith("https://")
    ) {
      return;
    }

    const domain = getDomain(href);

    if (!domain) {
      return;
    }

    /*
     * Try multiple selectors for snippet.
     */
    let snippet =
      container.find(".VwiC3b").first().text().trim();

    if (!snippet) {
      snippet =
        container.find(".yXK7lf").first().text().trim();
    }

    if (!snippet) {
      snippet =
        container.find("[data-sncf]").first().text().trim();
    }

    /*
     * Avoid duplicate results.
     */
    const alreadyExists = results.some(
      (result) => result.url === href
    );

    if (alreadyExists) {
      return;
    }

    results.push({
      position: results.length + 1,
      title,
      url: href,
      domain,
      snippet
    });
  });

  console.log(
    "Organic results parsed:",
    results.length
  );

  return results;
}

module.exports = {
  parseGoogleResults
};