// // routes/reviewerRoutes.js
// const express = require('express');
// const router = express.Router();

// const reviewerController = require('../controllers/reviewerController');


// const auth = require('../middleware/auth');
// const role = require('../middleware/role');

// // GET /api/reviewers - get all reviewers
// router.get('/', reviewerController.getAllReviewers);


// router.get(
//   '/pending',
//   auth,
//   role('reviewer'),
//   reviewerController.getPendingReviews
// );

// router.get(
//   '/reviewed',
//   auth,
//   role('reviewer'),
//   reviewerController.getReviewedSubmissions
// );

// router.post(
//   '/submit-review',
//   auth,
//   role('reviewer'),
//   reviewerController.submitReview
// );

// module.exports = router;
