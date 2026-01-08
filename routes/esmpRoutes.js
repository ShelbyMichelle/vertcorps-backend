const express = require('express');
const router = express.Router();
const esmpController = require('../controllers/esmpController');
const upload = require('../middleware/upload'); // multer

router.post('/upload', upload.single('file'), esmpController.uploadEsmp);
router.get('/', esmpController.getAllEsmps);
router.get('/status/:status', esmpController.getEsmpsByStatus);
router.put('/:esmpId/assign', esmpController.assignReviewer);
router.put('/:esmpId/review', esmpController.reviewAction);

module.exports = router;
