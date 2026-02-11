// controllers/esmpController.js
const { EsmpDistrictUpload, User, Review, Notification } = require('../models');
const { Op } = require('sequelize');

// ==============================
// GET ALL ESMPs (Admin & Reviewer)
// ==============================
exports.getAllEsmps = async (req, res) => {
  try {
    const esmps = await EsmpDistrictUpload.findAll({
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['id', 'name', 'email', 'district']
        }
      ]
    });

    res.json({ success: true, data: esmps });
  } catch (err) {
    console.error('Error fetching all ESMPs:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch ESMPs',
      error: err.message 
    });
  }
};

// ==============================
// GET ESMPs BY STATUS (Admin)
// ==============================
exports.getEsmpsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    
    // Validate status
    const validStatuses = ['Submitted', 'Pending', 'Approved', 'Rejected', 'Overdue', 'Returned'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Valid statuses: ' + validStatuses.join(', ')
      });
    }

    // For "Pending", we want to show both "Submitted" and "Pending" status
    const whereClause = status === 'Pending' 
      ? { status: { [Op.in]: ['Submitted', 'Pending'] } }
      : { status };

    const esmps = await EsmpDistrictUpload.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['id', 'name', 'email', 'district']
        }
      ]
    });

    res.json({ 
      success: true, 
      data: esmps,
      count: esmps.length 
    });
  } catch (err) {
    console.error('Error fetching ESMPs by status:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch ESMPs',
      error: err.message 
    });
  }
};

// ==============================
// ASSIGN REVIEWER TO ESMP (Admin)
// ==============================
exports.assignReviewer = async (req, res) => {
  try {
    const { esmpId } = req.params;
    const { reviewer_id } = req.body;

    // Verify ESMP exists
    const esmp = await EsmpDistrictUpload.findByPk(esmpId);
    if (!esmp) {
      return res.status(404).json({
        success: false,
        message: 'ESMP not found'
      });
    }

    // Verify reviewer exists and has correct role
    const reviewer = await User.findOne({
      where: { id: reviewer_id, role: 'reviewer' }
    });

    if (!reviewer) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reviewer ID or user is not a reviewer'
      });
    }

    // Update ESMP status to Pending if it's Submitted
    esmp.reviewer_id = reviewer_id;
    if (esmp.status === 'Submitted') {
      esmp.status = 'Pending';
      await esmp.save();
    }

// If you want multiple reviewers per ESMP, uncomment and use ReviewerAssignment.create instead:
// await ReviewerAssignment.create({
//   esmp_id: esmpId,
//   reviewer_id: reviewer_id,
//   assigned_by: req.user.id
// });

    // Create reviewer assignment (if you have ReviewerAssignment model)
    // await ReviewerAssignment.create({
    //   esmp_id: esmpId,
    //   reviewer_id: reviewer_id,
    //   assigned_by: req.user.id
    // });

    // Notify the reviewer
    await Notification.create({
      user_id: reviewer_id,
      title: 'ESMP Assigned to You',
      message: `You have been assigned to review ESMP "${esmp.project_name}" from ${esmp.district} district.`
    });

    // Notify the district user
    await Notification.create({
      user_id: esmp.submitted_by,
      title: 'ESMP Under Review',
      message: `Your ESMP "${esmp.project_name}" has been assigned to a reviewer.`
    });

    res.json({
      success: true,
      message: 'Reviewer assigned successfully',
      data: { esmp, reviewer: { id: reviewer.id, name: reviewer.name } }
    });

  } catch (err) {
    console.error('Error assigning reviewer:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to assign reviewer',
      error: err.message 
    });
  }
};

// ==============================
// REVIEW ACTION (Reviewer)
// ==============================
exports.reviewAction = async (req, res) => {
  try {
    const { esmpId } = req.params;
    const { status, review_comments } = req.body;

    // Validate status
    const validReviewStatuses = ['Approved', 'Returned', 'Rejected'];
    if (!validReviewStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review status. Valid: Approved, Returned, Rejected'
      });
    }

    // Find the ESMP
    const esmp = await EsmpDistrictUpload.findByPk(esmpId, {
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!esmp) {
      return res.status(404).json({
        success: false,
        message: 'ESMP not found'
      });
    }

    // Update ESMP status
    esmp.status = status;
    await esmp.save();

    // Create review record (if you have Review model)
    const review = await Review.create({
      esmp_id: esmpId,
      reviewer_id: req.user.id,
      status,
      comments: review_comments,
      reviewed_at: new Date()
    });

    // Handle file upload if provided (annotated document)
    if (req.file) {
      review.annotated_file_path = req.file.path;
      review.annotated_file_name = req.file.originalname;
      await review.save();
    }

    // Notify the district user
    let notificationMessage;
    switch (status) {
      case 'Approved':
        notificationMessage = `Your ESMP "${esmp.project_name}" has been approved.`;
        break;
      case 'Returned':
        notificationMessage = `Your ESMP "${esmp.project_name}" has been returned for revision. Please review the comments.`;
        break;
      case 'Rejected':
        notificationMessage = `Your ESMP "${esmp.project_name}" has been rejected. Please review the comments.`;
        break;
    }

    await Notification.create({
      user_id: esmp.submitted_by,
      title: `ESMP ${status}`,
      message: notificationMessage
    });

    // Notify admin
    const admins = await User.findAll({ where: { role: 'admin' } });
    const adminNotifications = admins.map(admin => ({
      user_id: admin.id,
      title: `ESMP Reviewed`,
      message: `ESMP "${esmp.project_name}" has been ${status.toLowerCase()} by reviewer ${req.user.name}.`
    }));

    await Notification.bulkCreate(adminNotifications);

    res.json({
      success: true,
      message: 'Review submitted successfully',
      data: { esmp, review }
    });

  } catch (err) {
    console.error('Error submitting review:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to submit review',
      error: err.message 
    });
  }
};

// ==============================
// GET ADMIN DASHBOARD STATS
// ==============================
exports.getAdminDashboardStats = async (req, res) => {
  try {
    const totalSubmissions = await EsmpDistrictUpload.count();
    
    const submitted = await EsmpDistrictUpload.count({
      where: { status: 'Submitted' }
    });

    const pending = await EsmpDistrictUpload.count({
      where: { status: { [Op.in]: ['Submitted', 'Pending'] } }
    });

    const approved = await EsmpDistrictUpload.count({
      where: { status: 'Approved' }
    });

    const returned = await EsmpDistrictUpload.count({
      where: { status: 'Returned' }
    });

    const rejected = await EsmpDistrictUpload.count({
      where: { status: 'Rejected' }
    });

    const overdue = await EsmpDistrictUpload.count({
      where: { status: 'Overdue' }
    });

    res.json({
      success: true,
      data: {
        totalSubmissions,
        submitted,
        pending,
        approved,
        returned,
        rejected,
        overdue
      }
    });

  } catch (err) {
    console.error('Error fetching admin dashboard stats:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: err.message 
    });
  }
};

// ==============================
// GET REVIEWER DASHBOARD STATS
// ==============================
exports.getReviewerDashboardStats = async (req, res) => {
  try {
    const reviewerId = req.user.id;

    // Total ESMPs assigned to this reviewer (if you have ReviewerAssignment model)
    // const assignedEsmps = await ReviewerAssignment.count({
    //   where: { reviewer_id: reviewerId }
    // });

    // Total reviews completed by this reviewer
    const reviewsCompleted = await Review.count({
      where: { reviewer_id: reviewerId }
    });

    // Pending reviews (ESMPs in Submitted/Pending status)
    const pendingReviews = await EsmpDistrictUpload.count({
      where: { status: { [Op.in]: ['Submitted', 'Pending'] } }
    });

    // Approved by this reviewer
    const approved = await Review.count({
      where: { reviewer_id: reviewerId, status: 'Approved' }
    });

    // Returned by this reviewer
    const returned = await Review.count({
      where: { reviewer_id: reviewerId, status: 'Returned' }
    });

    res.json({
      success: true,
      data: {
        pendingReviews,
        reviewsCompleted,
        approved,
        returned
      }
    });

  } catch (err) {
    console.error('Error fetching reviewer dashboard stats:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: err.message 
    });
  }
};


// Get all reviewers (for admin to assign)
exports.getReviewers = async (req, res) => {
  try {
    const reviewers = await User.findAll({
      where: { role: 'reviewer' },
      attributes: ['id', 'name', 'email'],
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: reviewers
    });
  } catch (err) {
    console.error('Error fetching reviewers:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviewers',
      error: err.message
    });
  }
};

