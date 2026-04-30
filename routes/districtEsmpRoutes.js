// routes/districtEsmpRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/districtEsmpController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const upload = require('../middleware/upload');
const { DISTRICT_EDO_ROLES } = require('../utils/roles');

// District EDO routes
router.post(
  '/submit',
  auth,
  role(...DISTRICT_EDO_ROLES), // Changed from 'district' to match your user type
  upload.single('esmp_file'),
  controller.submitEsmp
);

router.get(
  '/my-esmps',
  auth,
  role(...DISTRICT_EDO_ROLES),
  controller.getMyEsmps
);

router.get(
  '/dashboard-stats',
  auth,
  role(...DISTRICT_EDO_ROLES),
  controller.getDashboardStats
);

router.get(
  '/:id',
  auth,
  role(...DISTRICT_EDO_ROLES),
  controller.getSingleEsmp
);

router.get(
  '/:id/download',
  auth,
  role(...DISTRICT_EDO_ROLES),
  controller.downloadEsmpFile
);

router.put(
  '/resubmit/:id',
  auth,
  role(...DISTRICT_EDO_ROLES),
  upload.single('esmp_file'),
  controller.resubmitEsmp
);

module.exports = router;

// =====================================



