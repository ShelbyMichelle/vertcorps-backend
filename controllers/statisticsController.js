const { EsmpDistrictUpload, ReviewerAssignment, User } = require('../models');
const { Sequelize } = require('sequelize');


// ==============================
// OVERALL DASHBOARD STATS
// ==============================
exports.getDashboardStats = async (req, res) => {
  try {
    const total = await EsmpDistrictUpload.count();

    const byStatus = await EsmpDistrictUpload.findAll({
      attributes: [
        'status',
        [Sequelize.fn('COUNT', Sequelize.col('status')), 'count'],
      ],
      group: ['status'],
    });

    const formatted = {};
    byStatus.forEach(row => {
      formatted[row.status] = row.get('count');
    });

    res.json({
      success: true,
      data: {
        total,
        pending: formatted.Pending || 0,
        approved: formatted.Approved || 0,
        returned: formatted.Returned || 0,
        rejected: formatted.Rejected || 0,
        overdue: formatted.Overdue || 0,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to load stats' });
  }
};


// ==============================
// ESMPs BY DISTRICT
// ==============================
exports.getByDistrict = async (req, res) => {
  try {
    const data = await EsmpDistrictUpload.findAll({
      attributes: [
        'district',
        [Sequelize.fn('COUNT', Sequelize.col('district')), 'count'],
      ],
      group: ['district'],
      order: [[Sequelize.literal('count'), 'DESC']],
    });

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};


// ==============================
// ESMPs BY SECTOR
// ==============================
exports.getBySector = async (req, res) => {
  try {
    const data = await EsmpDistrictUpload.findAll({
      attributes: [
        'sector',
        [Sequelize.fn('COUNT', Sequelize.col('sector')), 'count'],
      ],
      group: ['sector'],
    });

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};


// ==============================
// ESMPs BY REVIEWER
// ==============================
exports.getByReviewer = async (req, res) => {
  try {
    const data = await ReviewerAssignment.findAll({
      attributes: [
        'reviewer_id',
        [Sequelize.fn('COUNT', Sequelize.col('reviewer_id')), 'count'],
      ],
      include: [
        {
          model: User,
          as: 'reviewer',
          attributes: ['id', 'name'],
        },
      ],
      group: ['reviewer_id'],
    });

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};
