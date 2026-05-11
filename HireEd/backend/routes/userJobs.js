const express = require("express");
const router = express.Router();
const userJobsController = require("../controllers/userJobsController");

// GET /user-jobs/:userId → fetch saved jobs
router.get("/:userId", userJobsController.getSavedJobs);

// POST /user-jobs → save a job
router.post("/", userJobsController.saveJob);

// DELETE /user-jobs → remove a saved job
router.delete("/", userJobsController.removeJob);

module.exports = router;
