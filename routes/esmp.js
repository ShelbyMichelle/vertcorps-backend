const express = require("express");
const router = express.Router();
const multer = require("multer");
const { EsmpDistrictUpload } = require("../models"); // Sequelize model

// Upload storage config
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname)
});

const upload = multer({ storage });

// ✅ POST UPLOAD & SAVE DATA INTO DB
router.post("/upload", upload.array("files"), async (req, res) => {
  try {
    const {
      esmp_id,
      district,
      subproject,
      coordinates,
      sector,
      cycle,
      funding
    } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    // Create multiple rows in PostgreSQL using Sequelize
    const uploadPromises = req.files.map(file =>
      EsmpDistrictUpload.create({
        esmp_id,
        district,
        subproject,
        coordinates,
        sector,
        cycle,
        funding_component: funding,
        file_name: file.originalname,
        file_path: file.path
      })
    );

    const uploadedFiles = await Promise.all(uploadPromises);

    res.json({
      success: true,
      insertedRows: uploadedFiles.length,
      files: uploadedFiles
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
