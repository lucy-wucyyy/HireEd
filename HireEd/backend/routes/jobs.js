const express = require('express');
const router = express.Router();

const jobController = require('../controllers/jobController');

router.get('/', jobController.getJobs);
router.post('/recommendations', jobController.updateCourseAndRecommendJobs);

module.exports = router;
