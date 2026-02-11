const { 
  EsmpDistrictUpload,
  ReviewerAssignment,
  User,
  Notification
} = require('../models');


// ==============================
// ASSIGN ESMP TO REVIEWER
// ==============================
// ✅ CORRECT - assignReviewer function
exports.assignReviewer = async (req, res) => {
  try {
    const { esmp_id, reviewer_id } = req.body;

    console.log('📌 Assignment Request:', { esmp_id, reviewer_id }); // ← Add this

    const esmp = await EsmpDistrictUpload.findByPk(esmp_id);
    if (!esmp) {
      return res.status(404).json({ success: false, message: 'ESMP not found' });
    }

    const reviewer = await User.findByPk(reviewer_id);
    if (!reviewer || reviewer.role !== 'reviewer') {
      return res.status(400).json({ success: false, message: 'Invalid reviewer' });
    }

    const existing = await ReviewerAssignment.findOne({
      where: { esmp_id }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'ESMP already assigned'
      });
    }

    const assignment = await ReviewerAssignment.create({
      esmp_id,
      reviewer_id,
      assigned_by: req.user.id
    });

    // ✅ Update the ESMP record with reviewer_id
    await esmp.update({ 
      reviewer_id: reviewer_id,
      status: 'Pending'
    });

    console.log('✅ ESMP Updated:', { 
      id: esmp.id, 
      reviewer_id: esmp.reviewer_id, 
      status: esmp.status 
    }); // ← Add this

    await Notification.create({
      user_id: reviewer_id,
      message: 'A new ESMP has been assigned to you'
    });

    res.json({
      success: true,
      message: 'Reviewer assigned successfully',
      assignment
    });

  } catch (err) {
    console.error('❌ Assignment Error:', err);
    res.status(500).json({ success: false, message: 'Assignment failed' });
  }
};
// ==============================
// CHANGE ESMP STATUS
// ==============================
exports.updateEsmpStatus = async (req, res) => {
  try {
    const { esmp_id, status, comments } = req.body;

    const allowed = ['Approved', 'Returned', 'Rejected'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const esmp = await EsmpDistrictUpload.findByPk(esmp_id);
    if (!esmp) {
      return res.status(404).json({ success: false, message: 'ESMP not found' });
    }

    await esmp.update({
      status,
      admin_comments: comments || null,
      reviewed_at: new Date()
    });
   

    // Notify district user
    await Notification.create({
      user_id: esmp.submitted_by,
      message: `Your ESMP has been ${status}`
    });

    res.json({
      success: true,
      message: `ESMP ${status.toLowerCase()} successfully`
    });

  } catch (err) {
    res.status(500).json({ success: false });
  }
};


// ==============================
// VIEW ALL ESMPs (ADMIN)
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
          include: [{ model: User, as: 'reviewer', attributes: ['id', 'name'] }]
        }
      ]
    });

    res.json({ success: true, data: esmps });
  } catch (err) {
    res.status(500).json({ success: false });
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
      return res.status(404).json({ success: false });
    }

    const newStatus = !user.is_active;
    await user.update({ is_active: newStatus });

    res.json({
      success: true,
      message: `User ${newStatus ? 'activated' : 'deactivated'}`
    });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};
