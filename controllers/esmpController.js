const { EsmpDistrictUpload, User, Review, Notification, sequelize } = require('../models');
const { Op } = require('sequelize');

// Helper functions (unchanged)
const successResponse = (res, data, message = 'Success', status = 200) => {
  res.status(status).json({ success: true, message, data });
};

const errorResponse = (res, message, status = 500, error = null) => {
  console.error(message, error || '');
  res.status(status).json({ success: false, message, error: error?.message || error });
};

// Keep overdue status in sync with deadlines.
const syncOverdueStatuses = async () => {
  await EsmpDistrictUpload.update(
    { status: 'Overdue' },
    {
      where: {
        deadline: { [Op.not]: null, [Op.lt]: new Date() },
        status: { [Op.in]: ['Submitted', 'Pending'] },
      },
    }
  );
};

// ==============================
// GET ALL ESMPs (Admin only)
// ==============================
exports.getAllEsmps = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return errorResponse(res, 'Access denied', 403);
    }

    await syncOverdueStatuses();

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

    await syncOverdueStatuses();

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

    return res.status(200).json({ success: true, message: 'Success', data: esmps, count: esmps.length });
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

    await syncOverdueStatuses();

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

    // Keep ESMP status values for UI/workflow, but map to Review model enum values.
    const reviewStatusMap = {
      Approved: 'Approved',
      Returned: 'Returned for Revision',
      Rejected: 'Rejected',
    };
    const reviewStatus = reviewStatusMap[status];

    const tx = await sequelize.transaction();
    let review;
    try {
      esmp.status = status;
      await esmp.save({ transaction: tx });

      review = await Review.create(
        {
          esmp_id: esmpId,
          reviewer_id: req.user.id,
          status: reviewStatus,
          comment: review_comments?.trim() || null,
        },
        { transaction: tx }
      );

      // Persist annotated file fields only if these columns exist on Review.
      if (req.file && Review.rawAttributes.annotated_file_path && Review.rawAttributes.annotated_file_name) {
        review.annotated_file_path = req.file.path;
        review.annotated_file_name = req.file.originalname;
        await review.save({ transaction: tx });
      }

      await Notification.create(
        {
          user_id: esmp.submitted_by,
          title: `ESMP ${status}`,
          message:
            status === 'Approved'
              ? `Your ESMP "${esmp.project_name}" has been approved.`
              : status === 'Returned'
              ? `Your ESMP "${esmp.project_name}" has been returned for revision. Please review the comments.`
              : `Your ESMP "${esmp.project_name}" has been rejected. Please review the comments.`,
        },
        { transaction: tx }
      );

      const admins = await User.findAll({ where: { role: 'admin' }, transaction: tx });
      // req.user comes from JWT and may not include name. Fetch reviewer name from DB.
      const reviewerUser = await User.findByPk(req.user.id, { transaction: tx });
      const reviewerName = reviewerUser ? reviewerUser.name : 'Reviewer';
      const adminNotifications = admins.map((admin) => ({
        user_id: admin.id,
        title: 'ESMP Reviewed',
        message: `ESMP "${esmp.project_name}" has been ${status.toLowerCase()} by reviewer ${reviewerName}.`,
      }));

      if (adminNotifications.length > 0) {
        // Create notifications individually within the transaction so hooks run
        await Promise.all(
          adminNotifications.map((n) => Notification.create(n, { transaction: tx }))
        );
      }

      await tx.commit();
    } catch (err) {
      await tx.rollback();
      throw err;
    }

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

    await syncOverdueStatuses();

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
      where: {
        reviewer_id: reviewerId,
        status: { [Op.in]: ['Returned', 'Returned for Revision'] },
      },
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

    await syncOverdueStatuses();

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
