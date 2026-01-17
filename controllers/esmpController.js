const { EsmpDistrictUpload, User } = require('../models');
const { createNotification } = require('./notificationController');

/**
 * =========================
 * CREATE / UPLOAD ESMP
 * =========================
 */
exports.uploadEsmp = async (req, res) => {
  try {
    const {
      esmp_id,
      project_name,
      district,
      subproject,
      coordinates,
      sector,
      cycle,
      funding_component,
      submitted_by,
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'File is required' });
    }

    // 1️⃣ Create ESMP with status "Submitted"
    const esmp = await EsmpDistrictUpload.create({
      esmp_id,
      project_name,
      district,
      subproject,
      coordinates,
      sector,
      cycle,
      funding_component,
      submitted_by,
      status: 'Submitted',
      file_name: req.file.originalname,
      file_path: req.file.path,
    });

    // 2️⃣ Notify all admins
    const admins = await User.findAll({ where: { role: 'admin' } });
    for (let admin of admins) {
      await createNotification({
        user_id: admin.id,
        title: 'New ESMP Submitted',
        message: `ESMP ${esmp.esmp_id} has been submitted by ${submitted_by}.`,
        type: 'NEW_SUBMISSION',
      });
    }

    // 3️⃣ Notify all reviewers
    const reviewers = await User.findAll({ where: { role: 'reviewer' } });
    for (let reviewer of reviewers) {
      await createNotification({
        user_id: reviewer.id,
        title: 'New ESMP Available for Review',
        message: `ESMP ${esmp.esmp_id} has been submitted and is ready for review.`,
        type: 'NEW_REVIEW',
      });
    }

    res.json({ success: true, data: esmp });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * =========================
 * GET ALL ESMPs
 * =========================
 */
exports.getAllEsmps = async (req, res) => {
  try {
    const esmps = await EsmpDistrictUpload.findAll({
      order: [['createdAt', 'DESC']],
    });

    res.json({ success: true, data: esmps });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * =========================
 * GET ESMPs BY STATUS
 * =========================
 */
exports.getEsmpsByStatus = async (req, res) => {
  try {
    const { status } = req.params;

    const esmps = await EsmpDistrictUpload.findAll({
      where: { status },
      order: [['createdAt', 'DESC']],
    });

    res.json({ success: true, data: esmps });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * =========================
 * ASSIGN REVIEWER
 * =========================
 */
exports.assignReviewer = async (req, res) => {
  try {
    const { esmpId } = req.params;
    const { reviewer_id, deadline } = req.body;

    const esmp = await EsmpDistrictUpload.findByPk(esmpId);
    if (!esmp) {
      return res.status(404).json({ success: false, message: 'ESMP not found' });
    }

    esmp.reviewer_id = reviewer_id;
    esmp.review_deadline = deadline;
    esmp.status = 'Pending';

    await esmp.save();

    // Create notification for the assigned reviewer
    await createNotification({
      user_id: reviewer_id,
      title: 'New ESMP Assigned',
      message: `You have been assigned ESMP ${esmp.esmp_id} for review.`,
      type: 'REVIEW_ASSIGNED',
    });

    res.json({ success: true, message: 'Reviewer assigned', data: esmp });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * =========================
 * REVIEWER ACTIONS
 * =========================
 */
exports.reviewAction = async (req, res) => {
  try {
    const { esmpId } = req.params;
    const { status, review_comments } = req.body;

    if (!['Approved', 'Returned', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const esmp = await EsmpDistrictUpload.findByPk(esmpId);
    if (!esmp) {
      return res.status(404).json({ success: false, message: 'ESMP not found' });
    }

    esmp.status = status;
    esmp.review_comments = review_comments;
    esmp.reviewed_at = new Date();

    await esmp.save();

    res.json({ success: true, data: esmp });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};