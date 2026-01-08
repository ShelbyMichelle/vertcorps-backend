const express = require("express");
const router = express.Router();
const multer = require("multer");
const mysql = require("mysql2");

// DB connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "vertcorps"
});

// Upload storage config
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname)
});

const upload = multer({ storage });

// ✅ POST UPLOAD & SAVE DATA INTO DB
router.post("/upload", upload.array("files"), (req, res) => {
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

    const sql = `
    INSERT INTO esmp_district_uploads
    (
      esmp_id,
      district,
      subproject,
      coordinates,
      sector,
      cycle,
      funding_component,
      file_name,
      file_path
    )
    VALUES ?
    `;

    const values = req.files.map(file => [
      esmp_id,
      district,
      subproject,
      coordinates,
      sector,
      cycle,
      funding,
      file.originalname,
      file.path
    ]);

    db.query(sql, [values], (err, result) => {
      if (err) throw err;
      res.json({
        success: true,
        insertedRows: result.affectedRows
      });
    });

  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

module.exports = router;
