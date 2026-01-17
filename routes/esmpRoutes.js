const express = require('express');
const router = express.Router();
const esmpController = require('../controllers/esmpController');
const upload = require('../middleware/upload'); // multer

// router.post('/upload', upload.single('file'), esmpController.uploadEsmp);
// router.get('/', esmpController.getAllEsmps);

// Get ESMPs by status
// router.get("/esmps/status/:status", esmpController.getEsmpsByStatus)
// router.get('/status/:status', esmpController.getEsmpsByStatus);
// router.put('/:esmpId/assign', esmpController.assignReviewer);
// router.put('/:esmpId/review', esmpController.reviewAction);



/**
 * Reviewer & Admin
 * Get ALL ESMPs
 */
router.get("/esmps", esmpController.getAllEsmps);

/**
 * Admin
 * Get ESMPs by status
 */
router.get("/esmps/status/:status", esmpController.getEsmpsByStatus);

module.exports = router;
