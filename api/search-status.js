const {
  getJob
} = require("../backend/src/services/searchJobs");

module.exports = async (req, res) => {
  try {
    const jobId =
      req.query.jobId;

    if (!jobId) {
      return res.status(400).json({
        message:
          "jobId is required"
      });
    }

    const job = getJob(jobId);

    if (!job) {
      return res.status(404).json({
        message: "Job not found"
      });
    }

    return res.status(200).json({
      jobId: job.id,
      status: job.status,
      keyword: job.keyword,
      targetDomain: job.targetDomain,
      position:
        job.position ?? null,
      found:
        job.found ?? false,
      matchingResults:
        job.matchingResults ?? [],
      results:
        job.results ?? [],
      error:
        job.error ?? null
    });

  } catch (error) {
    console.error(
      "Search status error:",
      error.message
    );

    return res.status(500).json({
      message:
        "Failed to get search status"
    });
  }
};