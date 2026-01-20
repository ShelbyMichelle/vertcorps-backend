// routes/districtEsmpRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/districtEsmpController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const upload = require('../middleware/upload');

// District EDO routes
router.post(
  '/submit',
  auth,
  role('district_EDO'), // Changed from 'district' to match your user type
  upload.single('esmp_file'),
  controller.submitEsmp
);

router.get(
  '/my-esmps',
  auth,
  role('district_EDO'),
  controller.getMyEsmps
);

router.get(
  '/dashboard-stats',
  auth,
  role('district_EDO'),
  controller.getDashboardStats
);

router.get(
  '/:id',
  auth,
  role('district_EDO'),
  controller.getSingleEsmp
);

router.put(
  '/resubmit/:id',
  auth,
  role('district_EDO'),
  upload.single('esmp_file'),
  controller.resubmitEsmp
);

module.exports = router;

// =====================================


