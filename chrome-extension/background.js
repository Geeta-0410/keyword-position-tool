const BACKEND_URL =
  "http://localhost:5000";

let processingJobId = null;

async function getPendingJob() {
  try {
    const response = await fetch(
      `${BACKEND_URL}/api/extension-pending`
    );

    if (!response.ok) {
      console.error(
        "Pending job request failed:",
        response.status
      );

      return null;
    }

    const data =
      await response.json();

    return data.job || null;

  } catch (error) {
    console.error(
      "Backend connection error:",
      error.message
    );

    return null;
  }
}

async function processJob(job) {
  if (!job) {
    return;
  }

  if (processingJobId) {
    return;
  }

  processingJobId = job.id;

  console.log(
    "Processing search job:",
    job
  );

  try {
    const searchUrl =
      `https://www.google.com/search?q=${encodeURIComponent(
        job.keyword
      )}`;

    console.log(
      "Opening Google:",
      searchUrl
    );

    const tab =
      await chrome.tabs.create({
        url: searchUrl,
        active: true
      });

    console.log(
      "Google tab created:",
      tab.id
    );

  } catch (error) {
    console.error(
      "Failed to open Google:",
      error.message
    );

    processingJobId = null;
  }
}

async function checkForJobs() {
  const job =
    await getPendingJob();

  if (!job) {
    return;
  }

  await processJob(job);
}

setInterval(
  checkForJobs,
  3000
);

checkForJobs();

console.log(
  "Keyword Position Checker background worker loaded"
);