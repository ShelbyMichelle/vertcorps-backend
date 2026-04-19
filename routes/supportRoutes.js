const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const supportController = require("../controllers/supportController");

// POST /api/support/contact
router.post("/contact", auth, supportController.contactDeveloper);

module.exports = router;

