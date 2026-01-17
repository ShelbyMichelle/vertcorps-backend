// // controllers/reviewerController.js

// // Get all reviewers
// exports.getAllReviewers = async (req, res) => {
//   try {
//     // Assuming your User model has a 'role' field and reviewers have role='reviewer'
//     const reviewers = await User.findAll({
//       where: { role: 'reviewer' },
//       attributes: ['id', 'fullname', 'email', 'role'],
//     });

//     res.json(reviewers);
//   } catch (error) {
//     console.error('Error fetching reviewers:', error);
//     res.status(500).json({ message: 'Server error fetching reviewers' });
//   }
// };




// ///
// const {
//   ReviewerAssignment,
//   ReviewerReview,
//   EsmpDistrictUpload,
//   User,
// } = require('../models');

// const { createNotification } = require('./notificationController');


// // ==========================
// // GET PENDING REVIEWS
// // ==========================
// exports.getPendingReviews = async (req, res) => {
//   try {
//     const reviewerId = req.user.id;

//     const assignments = await ReviewerAssignment.findAll({
//       where: { reviewer_id: reviewerId, status: 'Assigned' },
//       include: [
//         { model: EsmpDistrictUpload, as: 'esmp' }
//       ],
//       order: [['deadline', 'ASC']],
//     });

//     res.json({ success: true, data: assignments });
//   } catch (err) {
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };


// // ==========================
// // GET COMPLETED REVIEWS
// // ==========================
// exports.getReviewedSubmissions = async (req, res) => {
//   try {
//     const reviewerId = req.user.id;

//     const assignments = await ReviewerAssignment.findAll({
//       where: { reviewer_id: reviewerId, status: 'Completed' },
//       include: [
//         { model: EsmpDistrictUpload, as: 'esmp' },
//         { model: ReviewerReview, as: 'review' }
//       ],
//     });

//     res.json({ success: true, data: assignments });
//   } catch (err) {
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };


// // ==========================
// // SUBMIT REVIEW
// // ==========================
// exports.submitReview = async (req, res) => {
//   try {
//     const reviewerId = req.user.id;
//     const { assignment_id, comments, recommendation } = req.body;

//     const assignment = await ReviewerAssignment.findOne({
//       where: { id: assignment_id, reviewer_id: reviewerId },
//       include: [{ model: EsmpDistrictUpload, as: 'esmp' }],
//     });

//     if (!assignment) {
//       return res.status(404).json({ success: false, message: 'Assignment not found' });
//     }

//     // Save review
//     await ReviewerReview.create({
//       assignment_id,
//       comments,
//       recommendation,
//     });

//     // Update assignment
//     assignment.status = 'Completed';
//     await assignment.save();

//     // Update ESMP status
//     assignment.esmp.status =
//       recommendation === 'Approve' ? 'Approved' :
//       recommendation === 'Return' ? 'Returned' : 'Rejected';

//     await assignment.esmp.save();

//     // Notify District EDO
//     await createNotification({
//       user_id: assignment.esmp.submitted_by,
//       title: 'ESMP Reviewed',
//       message: `Your ESMP ${assignment.esmp.esmp_id} has been reviewed.`,
//       type:
//         recommendation === 'Approve'
//           ? 'ESMP_APPROVED'
//           : recommendation === 'Return'
//           ? 'ESMP_RETURNED'
//           : 'ESMP_REJECTED',
//     });

//     res.json({ success: true, message: 'Review submitted successfully' });
//   } catch (err) {
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };
