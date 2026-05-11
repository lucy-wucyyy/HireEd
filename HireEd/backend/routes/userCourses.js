const express = require("express");
const router = express.Router();
const userCoursesController = require("../controllers/userCoursesController");

// GET /user-courses/:userId → fetch saved courses
router.get("/:userId", userCoursesController.getSavedCourses);

// POST /user-courses → save a course
router.post("/", userCoursesController.saveCourse);

// DELETE /user-courses → remove a saved course
router.delete("/", userCoursesController.removeCourse);

// POST /user-courses/completed → mark a course as completed (using stored procedure now)
// router.post("/completed", userCoursesController.completeCourse);

module.exports = router;
