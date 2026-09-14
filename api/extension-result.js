const {
  getJob,
  updateJob
} = require("../backend/src/services/searchJobs");

const {
  calculateRank
} = require("../backend/src/services/rankCalculator");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({
      message: "Method not allowed"
    });
  }

  try {
    const {
      jobId,
      results
    } = req.body || {};

    if (!jobId) {
      return res.status(400).json({
        message: "jobId is required"
      });
    }

    if (!Array.isArray(results)) {
      return res.status(400).json({
        message:
          "results must be an array"
      });
    }

    const job = getJob(jobId);

    if (!job) {
      return res.status(404).json({
        message: "Job not found"
      });
    }

    const ranking =
      calculateRank(
        results,
        job.targetDomain,
        job.keyword
      );

    updateJob(jobId, {
      status: "completed",
      position: ranking.position,
      found: ranking.found,
      matchingResults:
        ranking.matchingResults,
      results: ranking.results
    });

    return res.status(200).json({
      success: true,
      jobId,
      position: ranking.position,
      found: ranking.found
    });

  } catch (error) {
    console.error(
      "Extension result error:",
      error.message
    );

    return res.status(500).json({
      message:
        "Failed to process extension results"
    });
  }
};