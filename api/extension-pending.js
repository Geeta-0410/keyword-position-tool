const {
  getPendingJob
} = require("../backend/src/services/searchJobs");

module.exports = async (req, res) => {
  try {
    const job = getPendingJob();

    if (!job) {
      return res.status(200).json({
        job: null
      });
    }

    return res.status(200).json({
      job: {
        id: job.id,
        keyword: job.keyword,
        targetDomain: job.targetDomain
      }
    });

  } catch (error) {
    console.error(
      "Pending job error:",
      error.message
    );

    return res.status(500).json({
      message:
        "Failed to get pending job"
    });
  }
};