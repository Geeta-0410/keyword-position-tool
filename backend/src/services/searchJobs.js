const jobs = new Map();

function createJob(keyword, targetDomain) {
  const id =
    `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 10)}`;

  const job = {
    id,
    keyword,
    targetDomain,
    status: "pending",
    results: null,
    error: null,
    createdAt: Date.now()
  };

  jobs.set(id, job);

  return job;
}

function getJob(id) {
  return jobs.get(id);
}

function updateJob(id, updates) {
  const job = jobs.get(id);

  if (!job) {
    return null;
  }

  Object.assign(job, updates);

  return job;
}

function getPendingJob() {
  for (const job of jobs.values()) {
    if (job.status === "pending") {
      return job;
    }
  }

  return null;
}

module.exports = {
  createJob,
  getJob,
  updateJob,
  getPendingJob
};