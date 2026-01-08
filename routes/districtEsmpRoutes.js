const express = require('express');
const router = express.Router();
const controller = require('../controllers/districtEsmpController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const upload = require('../middleware/upload');

// District only
router.post(
  '/submit',
  auth,
  role('district'),
  upload.single('esmp_file'),
  controller.submitEsmp
);

router.get(
  '/my-esmps',
  auth,
  role('district'),
  controller.getMyEsmps
);

router.get(
  '/:id',
  auth,
  role('district'),
  controller.getSingleEsmp
);

router.put(
  '/resubmit/:id',
  auth,
  role('district'),
  upload.single('esmp_file'),
  controller.resubmitEsmp
);

module.exports = router;
