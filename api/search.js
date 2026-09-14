const {
  createJob
} = require("../backend/src/services/searchJobs");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({
      message: "Method not allowed"
    });
  }

  try {
    const {
      keyword,
      targetDomain
    } = req.body || {};

    if (
      !keyword ||
      typeof keyword !== "string" ||
      !targetDomain ||
      typeof targetDomain !== "string"
    ) {
      return res.status(400).json({
        message:
          "Keyword and targetDomain are required"
      });
    }

    const cleanKeyword =
      keyword.trim();

    const cleanTarget =
      targetDomain.trim();

    if (
      !cleanKeyword ||
      !cleanTarget
    ) {
      return res.status(400).json({
        message:
          "Keyword and targetDomain cannot be empty"
      });
    }

    const job = createJob(
      cleanKeyword,
      cleanTarget
    );

    return res.status(202).json({
      jobId: job.id,
      status: job.status,
      keyword: job.keyword,
      targetDomain: job.targetDomain
    });

  } catch (error) {
    console.error(
      "Create search job error:",
      error.message
    );

    return res.status(500).json({
      message:
        "Failed to create search job"
    });
  }
};