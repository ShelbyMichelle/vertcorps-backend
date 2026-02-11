// controllers/districtEsmpController.js
const path = require('path');
const fs = require('fs');
const { EsmpDistrictUpload, Notification, User } = require('../models');

// ==============================
// SUBMIT NEW ESMP
// ==============================
exports.submitEsmp = async (req, res) => {
  try {
    const {
      project_name,
      district,
      subproject,
      coordinates,
      sector,
      cycle,
      funding_component
    } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'ESMP file is required'
      });
    }

    // Generate ESMP ID
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000);
    const esmpId = `ESMP-${timestamp}-${random}`;

    // Create the ESMP record with status "Submitted"
    const esmp = await EsmpDistrictUpload.create({
      esmp_id: esmpId,
      project_name,
      district,
      subproject,
      coordinates,
      sector,
      cycle,
      funding_component,
      submitted_by: req.user.id,
      file_name: req.file.originalname,
      file_path: req.file.path,
      status: 'Submitted' // Changed from 'Pending' to 'Submitted'
    });

    // Create notifications for admin and reviewers
    // Find all admins
    const admins = await User.findAll({ where: { role: 'admin' } });
    
    // Find all reviewers
    const reviewers = await User.findAll({ where: { role: 'reviewer' } });

    // Create notifications for all admins
    const adminNotifications = admins.map(admin => ({
      user_id: admin.id,
      title: 'New ESMP Submitted',
      message: `New ESMP "${project_name}" from ${district} district has been submitted for review.`
    }));

    // Create notifications for all reviewers
    // const reviewerNotifications = reviewers.map(reviewer => ({
    //   user_id: reviewer.id,
    //   title: 'New ESMP Submitted',
    //   message: `New ESMP "${project_name}" from ${district} district is pending your review.`
    // }));

    // Bulk create all notifications
    await Notification.bulkCreate([...adminNotifications]);

    res.status(201).json({
      success: true,
      message: 'ESMP submitted successfully',
      data: esmp
    });

  } catch (err) {
    console.error('Error submitting ESMP:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to submit ESMP',
      error: err.message 
    });
  }
};

// ==============================
// VIEW MY ESMPs (DISTRICT)
// ==============================
exports.getMyEsmps = async (req, res) => {
  try {
    const esmps = await EsmpDistrictUpload.findAll({
      where: { submitted_by: req.user.id },
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.json({ success: true, data: esmps });
  } catch (err) {
    console.error('Error fetching ESMPs:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch ESMPs',
      error: err.message 
    });
  }
};

// ==============================
// VIEW SINGLE ESMP
// ==============================
exports.getSingleEsmp = async (req, res) => {
  try {
    const esmp = await EsmpDistrictUpload.findOne({
      where: {
        id: req.params.id,
        submitted_by: req.user.id
      },
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

    res.json({ success: true, data: esmp });
  } catch (err) {
    console.error('Error fetching ESMP:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch ESMP',
      error: err.message 
    });
  }
};

// ==============================
// RESUBMIT RETURNED ESMP
// ==============================
exports.resubmitEsmp = async (req, res) => {
  try {
    const esmp = await EsmpDistrictUpload.findOne({
      where: {
        id: req.params.id,
        submitted_by: req.user.id,
        status: 'Returned'
      }
    });

    if (!esmp) {
      return res.status(400).json({
        success: false,
        message: 'Only returned ESMPs can be resubmitted'
      });
    }

    // Replace file if uploaded
    if (req.file) {
      // Delete old file if it exists
      if (fs.existsSync(esmp.file_path)) {
        fs.unlinkSync(esmp.file_path);
      }

      esmp.file_name = req.file.originalname;
      esmp.file_path = req.file.path;
    }

    // Update status back to 'Submitted'
    esmp.status = 'Submitted';
    await esmp.save();

    // Notify admins and reviewers again
    const admins = await User.findAll({ where: { role: 'admin' } });
    const reviewers = await User.findAll({ where: { role: 'reviewer' } });

    const notifications = [
      ...admins.map(admin => ({
        user_id: admin.id,
        title: 'ESMP Resubmitted',
        message: `ESMP "${esmp.project_name}" has been resubmitted for review.`
      })),
      ...reviewers.map(reviewer => ({
        user_id: reviewer.id,
        title: 'ESMP Resubmitted',
        message: `ESMP "${esmp.project_name}" has been resubmitted and is pending your review.`
      }))
    ];

    await Notification.bulkCreate(notifications);

    res.json({
      success: true,
      message: 'ESMP resubmitted successfully',
      data: esmp
    });

  } catch (err) {
    console.error('Error resubmitting ESMP:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to resubmit ESMP',
      error: err.message 
    });
  }
};

// ==============================
// GET DASHBOARD STATISTICS
// ==============================
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Count ESMPs by status for this district user
    const submitted = await EsmpDistrictUpload.count({
      where: { submitted_by: userId, status: 'Submitted' }
    });

    const pending = await EsmpDistrictUpload.count({
      where: { submitted_by: userId, status: ['Submitted', 'Pending'] }
    });

    const approved = await EsmpDistrictUpload.count({
      where: { submitted_by: userId, status: 'Approved' }
    });

    const returned = await EsmpDistrictUpload.count({
      where: { submitted_by: userId, status: 'Returned' }
    });

    const overdue = await EsmpDistrictUpload.count({
      where: { submitted_by: userId, status: 'Overdue' }
    });

    res.json({
      success: true,
      data: {
        submitted,
        pending,
        approved,
        returned,
        overdue,
        total: submitted + pending + approved + returned + overdue
      }
    });

  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: err.message 
    });
  }
};