const path = require('path');
const fs = require('fs');
const { EsmpDistrictUpload, Notification } = require('../models');


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

    const esmp = await EsmpDistrictUpload.create({
      esmp_id: `ESMP-${Date.now()}`,
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
      status: 'Pending'
    });

    // Notify admin (optional)
    await Notification.create({
      user_id: 1, // admin id or admin group later
      message: 'New ESMP submitted for review'
    });

    res.status(201).json({
      success: true,
      message: 'ESMP submitted successfully',
      data: esmp
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};


// ==============================
// VIEW MY ESMPs (DISTRICT)
// ==============================
exports.getMyEsmps = async (req, res) => {
  try {
    const esmps = await EsmpDistrictUpload.findAll({
      where: { submitted_by: req.user.id },
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, data: esmps });
  } catch (err) {
    res.status(500).json({ success: false });
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
      }
    });

    if (!esmp) {
      return res.status(404).json({ success: false });
    }

    res.json({ success: true, data: esmp });
  } catch (err) {
    res.status(500).json({ success: false });
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
      if (fs.existsSync(esmp.file_path)) {
        fs.unlinkSync(esmp.file_path);
      }

      esmp.file_name = req.file.originalname;
      esmp.file_path = req.file.path;
    }

    esmp.status = 'Pending';
    await esmp.save();

    res.json({
      success: true,
      message: 'ESMP resubmitted successfully'
    });

  } catch (err) {
    res.status(500).json({ success: false });
  }
};
