const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const db = require("../db"); // mysql connection

//  ADD USER
router.post("/add-user", async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);

    db.query(
      "INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)",
      [name, email, hashed, role],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "User already exists or DB error" });
        }

        res.json({ success: true, message: "User created successfully" });
      }
    );
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
});


//  GET USERS
router.get("/users", (req, res) => {
  db.query(
    "SELECT id, name, email, role FROM users ORDER BY created_at DESC",
    (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results);
    }
  )
})

module.exports = router;
