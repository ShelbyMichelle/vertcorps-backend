// ============================================
// controllers/reviewerController.js 
// ============================================
const path = require('path');
const fs = require('fs');
const { EsmpDistrictUpload, User } = require('../models');

// Get all submitted ESMPs (for download list)
// Get ESMPs assigned to the logged-in reviewer
exports.getSubmittedEsmps = async (req, res) => {
  try {
    // Get all ESMPs with reviewer_id field included
    const esmps = await EsmpDistrictUpload.findAll({
      where: {
        status: ['Submitted', 'Pending', 'Pending', 'Approved', 'Returned']
      },
      // ✅ Explicitly include reviewer_id in the attributes
      attributes: [
        'id', 
        'esmp_id', 
        'project_name', 
        'district', 
        'subproject',
        'coordinates',
        'sector',
        'cycle',
        'funding_component',
        'status',
        'file_name',
        'file_path',
        'submitted_by',
        'reviewer_id',  // ← THIS IS THE KEY FIELD
        'deadline',
        'createdAt',
        'updatedAt'
      ],
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'User', // Make sure this alias matches your model association
          attributes: ['id', 'name', 'email', 'district']
        }
      ]
    });

    console.log('📤 Sending ESMPs to reviewer:', {
      total: esmps.length,
      sample: esmps[0] // Log first ESMP to see structure
    });

    res.json({ 
      success: true, 
      data: esmps 
    });
  } catch (err) {
    console.error('❌ Error fetching ESMPs:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch ESMPs',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Server error'
    });
  }
};
// Download a specific ESMP file
exports.downloadEsmpFile = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the ESMP
    const esmp = await EsmpDistrictUpload.findByPk(id);

    if (!esmp) {
      return res.status(404).json({
        success: false,
        message: 'ESMP not found'
      });
    }

    // Check if file exists
    const filePath = path.resolve(esmp.file_path);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    // Set headers for download
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${esmp.file_name}"`);

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (err) {
    console.error('❌ Error downloading file:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to download file',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Server error'
    });
  }
};

// Get ESMP details (for viewing before download)
exports.getEsmpDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const esmp = await EsmpDistrictUpload.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email', 'district']
        }
      ]
    });

    if (!esmp) {
      return res.status(404).json({
        success: false,
        message: 'ESMP not found'
      });
    }

    res.json({ 
      success: true, 
      data: esmp 
    });
  } catch (err) {
    console.error('❌ Error fetching ESMP details:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch ESMP details',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Server error'
    });
  }
};

module.exports = exports;
