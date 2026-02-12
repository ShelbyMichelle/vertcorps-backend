const { EsmpDistrictUpload, User, Review, Notification } = require('../models');
const { Op } = require('sequelize');

// Helper functions (unchanged)
const successResponse = (res, data, message = 'Success', status = 200) => {
  res.status(status).json({ success: true, message, data });
};

const errorResponse = (res, message, status = 500, error = null) => {
  console.error(message, error || '');
  res.status(status).json({ success: false, message, error: error?.message || error });
};

// ==============================
// GET ALL ESMPs (Admin only)
// ==============================
exports.getAllEsmps = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return errorResponse(res, 'Access denied', 403);
    }

    const esmps = await EsmpDistrictUpload.findAll({
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['id', 'name', 'email', 'district'],
        },
      ],
    });

    successResponse(res, esmps);
  } catch (err) {
    errorResponse(res, 'Failed to fetch all ESMPs', 500, err);
  }
};

// ==============================
// GET ESMPs BY STATUS (Admin)
// ==============================
exports.getEsmpsByStatus = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return errorResponse(res, 'Access denied', 403);
    }

    const { status } = req.params;
    const validStatuses = ['Submitted', 'Pending', 'Approved', 'Rejected', 'Overdue', 'Returned'];

    if (!validStatuses.includes(status)) {
      return errorResponse(res, `Invalid status. Valid: ${validStatuses.join(', ')}`, 400);
    }

    const whereClause =
      status === 'Pending'
        ? { status: { [Op.in]: ['Submitted', 'Pending'] } }
        : { status };

    const esmps = await EsmpDistrictUpload.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['id', 'name', 'email', 'district'],
        },
      ],
    });

    successResponse(res, { esmps, count: esmps.length });
  } catch (err) {
    errorResponse(res, 'Failed to fetch ESMPs by status', 500, err);
  }
};

// ==============================
// GET ASSIGNED ESMPs FOR CURRENT REVIEWER
// ==============================
exports.getMyAssignedEsmps = async (req, res) => {
  try {
    if (req.user.role !== 'reviewer') {
      return errorResponse(res, 'Access denied', 403);
    }

    const esmps = await EsmpDistrictUpload.findAll({
      where: {
        reviewer_id: req.user.id,
      },
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['id', 'name', 'email', 'district'],
        },
      ],
    });

    successResponse(res, esmps);
  } catch (err) {
    errorResponse(res, 'Failed to fetch your assigned ESMPs', 500, err);
  }
};

// ==============================
// REVIEW ACTION (Reviewer only)
// ==============================
exports.reviewAction = async (req, res) => {
  try {
    if (req.user.role !== 'reviewer') {
      return errorResponse(res, 'Access denied', 403);
    }

    const { esmpId } = req.params;
    const { status, review_comments } = req.body;

    const validStatuses = ['Approved', 'Returned', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return errorResponse(res, `Invalid status. Valid: ${validStatuses.join(', ')}`, 400);
    }

    const esmp = await EsmpDistrictUpload.findByPk(esmpId, {
      include: [{ model: User, as: 'User', attributes: ['id', 'name', 'email'] }],
    });

    if (!esmp) {
      return errorResponse(res, 'ESMP not found', 404);
    }

    if (esmp.reviewer_id !== req.user.id) {
      return errorResponse(res, 'You are not assigned to review this ESMP', 403);
    }

    esmp.status = status;
    await esmp.save();

    const review = await Review.create({
      esmp_id: esmpId,
      reviewer_id: req.user.id,
      status,
      comments: review_comments?.trim() || null,
      reviewed_at: new Date(),
    });

    if (req.file) {
      review.annotated_file_path = req.file.path;
      review.annotated_file_name = req.file.originalname;
      await review.save();
    }

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
      message: notificationMessage,
    });

    const admins = await User.findAll({ where: { role: 'admin' } });
    const adminNotifications = admins.map((admin) => ({
      user_id: admin.id,
      title: `ESMP Reviewed`,
      message: `ESMP "${esmp.project_name}" has been ${status.toLowerCase()} by reviewer ${req.user.name}.`,
    }));

    await Notification.bulkCreate(adminNotifications);

    successResponse(res, { esmp, review }, 'Review submitted successfully');
  } catch (err) {
    errorResponse(res, 'Failed to submit review', 500, err);
  }
};

// ==============================
// GET REVIEWER DASHBOARD STATS
// ==============================
exports.getReviewerDashboardStats = async (req, res) => {
  try {
    if (req.user.role !== 'reviewer') {
      return errorResponse(res, 'Access denied', 403);
    }

    const reviewerId = req.user.id;

    const pendingReviews = await EsmpDistrictUpload.count({
      where: {
        reviewer_id: reviewerId,
        status: { [Op.in]: ['Submitted', 'Pending'] },
      },
    });

    const reviewsCompleted = await Review.count({
      where: { reviewer_id: reviewerId },
    });

    const approved = await Review.count({
      where: { reviewer_id: reviewerId, status: 'Approved' },
    });

    const returned = await Review.count({
      where: { reviewer_id: reviewerId, status: 'Returned' },
    });

    successResponse(res, {
      pendingReviews,
      reviewsCompleted,
      approved,
      returned,
    });
  } catch (err) {
    errorResponse(res, 'Failed to fetch reviewer dashboard statistics', 500, err);
  }
};

// ==============================
// GET ALL REVIEWERS (Admin only)
// ==============================
exports.getReviewers = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return errorResponse(res, 'Access denied', 403);
    }

    const reviewers = await User.findAll({
      where: { role: 'reviewer' },
      attributes: ['id', 'name', 'email'],
      order: [['name', 'ASC']],
    });

    successResponse(res, reviewers);
  } catch (err) {
    errorResponse(res, 'Failed to fetch reviewers', 500, err);
  }
};

// ==============================
// GET ADMIN DASHBOARD STATS
// ==============================
exports.getAdminDashboardStats = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return errorResponse(res, 'Access denied', 403);
    }

    const totalSubmissions = await EsmpDistrictUpload.count();

    const submitted = await EsmpDistrictUpload.count({ where: { status: 'Submitted' } });
    const pending = await EsmpDistrictUpload.count({
      where: { status: { [Op.in]: ['Submitted', 'Pending'] } },
    });
    const approved = await EsmpDistrictUpload.count({ where: { status: 'Approved' } });
    const returned = await EsmpDistrictUpload.count({ where: { status: 'Returned' } });
    const rejected = await EsmpDistrictUpload.count({ where: { status: 'Rejected' } });
    const overdue = await EsmpDistrictUpload.count({ where: { status: 'Overdue' } });

    successResponse(res, {
      totalSubmissions,
      submitted,
      pending,
      approved,
      returned,
      rejected,
      overdue,
    });
  } catch (err) {
    errorResponse(res, 'Failed to fetch admin dashboard statistics', 500, err);
  }
};