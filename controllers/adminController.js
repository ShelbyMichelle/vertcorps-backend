const { 
  EsmpDistrictUpload,
  ReviewerAssignment,
  User,
  Notification
} = require('../models');
const { Op } = require('sequelize');

// Helper for consistent responses (optional - you can keep your style)
const successResponse = (res, data, message = 'Success', status = 200) => {
  res.status(status).json({ success: true, message, data });
};

const errorResponse = (res, message, status = 500, error = null) => {
  console.error(message, error || '');
  res.status(status).json({ success: false, message, error: error?.message || error });
};

// ==============================
// ASSIGN ESMP TO REVIEWER (Admin only)
// ==============================
exports.assignReviewer = async (req, res) => {
  try {
    const { esmpId } = req.params;
    const { reviewer_id, deadline } = req.body;

    if (!reviewer_id) {
      return errorResponse(res, 'Reviewer ID is required', 400);
    }

    const esmp = await EsmpDistrictUpload.findByPk(esmpId);
    if (!esmp) {
      return errorResponse(res, 'ESMP not found', 404);
    }

    const reviewer = await User.findOne({
      where: { id: reviewer_id, role: 'reviewer' },
    });
    if (!reviewer) {
      return errorResponse(res, 'Invalid reviewer ID or user is not a reviewer', 400);
    }

    // Optional: prevent re-assignment (if you don't want to allow changing reviewer)
    if (esmp.reviewer_id) {
      return errorResponse(res, 'ESMP is already assigned to a reviewer', 400);
    }

    // Update ESMP
    esmp.reviewer_id = reviewer_id;

    if (esmp.status === 'Submitted') {
      esmp.status = 'Pending';
    }

    if (deadline) {
      const deadlineDate = new Date(deadline);
      if (isNaN(deadlineDate.getTime())) {
        return errorResponse(res, 'Invalid deadline format', 400);
      }
      if (deadlineDate < new Date()) {
        return errorResponse(res, 'Deadline cannot be in the past', 400);
      }
      esmp.deadline = deadlineDate;
    }

    await esmp.save();

    // Optional: If you still want to use ReviewerAssignment model for audit/history
    await ReviewerAssignment.create({
      esmp_id: esmp.id,
      reviewer_id,
      assigned_by: req.user.id,
    });

    // Notify reviewer
    await Notification.create({
      user_id: reviewer_id,
      title: 'New ESMP Assigned',
      message: `You have been assigned to review "${esmp.project_name}" from ${esmp.district}.`,
    });

    // Notify submitter (district EDO)
    await Notification.create({
      user_id: esmp.submitted_by,
      title: 'ESMP Assigned for Review',
      message: `Your ESMP "${esmp.project_name}" has been assigned to a reviewer.`,
    });

    successResponse(res, {
      esmpId: esmp.id,
      reviewer_id,
      reviewer_name: reviewer.name,
      status: esmp.status,
      deadline: esmp.deadline,
    }, 'Reviewer assigned successfully');
  } catch (err) {
    errorResponse(res, 'Failed to assign reviewer', 500, err);
  }
};

// ==============================
// CHANGE ESMP STATUS (Admin override / bulk?)
// ==============================
exports.updateEsmpStatus = async (req, res) => {
  try {
    const { esmp_id, status, comments } = req.body;

    const allowed = ['Approved', 'Returned', 'Rejected'];
    if (!allowed.includes(status)) {
      return errorResponse(res, `Invalid status. Allowed: ${allowed.join(', ')}`, 400);
    }

    const esmp = await EsmpDistrictUpload.findByPk(esmp_id);
    if (!esmp) {
      return errorResponse(res, 'ESMP not found', 404);
    }

    await esmp.update({
      status,
      admin_comments: comments || null,
      reviewed_at: new Date(),
    });

    // Notify submitter
    await Notification.create({
      user_id: esmp.submitted_by,
      title: `ESMP ${status}`,
      message: `Your ESMP "${esmp.project_name}" has been ${status.toLowerCase()} by admin.`,
    });

    successResponse(res, { esmp }, `ESMP ${status.toLowerCase()} successfully`);
  } catch (err) {
    errorResponse(res, 'Failed to update ESMP status', 500, err);
  }
};

// ==============================
// VIEW ALL ESMPs (ADMIN) - with optional filters
// ==============================
exports.getAllEsmps = async (req, res) => {
  try {
    const { status, district } = req.query;

    const where = {};
    if (status) where.status = status;
    if (district) where.district = district;

    const esmps = await EsmpDistrictUpload.findAll({
      where,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: ReviewerAssignment,
          include: [{ model: User, as: 'reviewer', attributes: ['id', 'name'] }],
        },
        { model: User, as: 'User', attributes: ['name', 'district'] },
      ],
    });

    successResponse(res, esmps);
  } catch (err) {
    errorResponse(res, 'Failed to fetch ESMPs', 500, err);
  }
};

// ==============================
// ACTIVATE / DEACTIVATE USER
// ==============================
exports.toggleUserStatus = async (req, res) => {
  try {
    const { user_id } = req.params;

    const user = await User.findByPk(user_id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    const newStatus = !user.is_active;
    await user.update({ is_active: newStatus });

    successResponse(res, null, `User ${newStatus ? 'activated' : 'deactivated'}`);
  } catch (err) {
    errorResponse(res, 'Failed to toggle user status', 500, err);
  }
};