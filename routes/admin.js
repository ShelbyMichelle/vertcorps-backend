const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const db = require("../models");
const User = db.User;

// POST /api/admin/add-user
router.post("/add-user", async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);

    const [user, created] = await User.findOrCreate({
      where: { email },
      defaults: {
        name,
        password: hashed,
        role
      }
    });

    if (!created) {
      return res.status(400).json({ message: "User already exists" });
    }

    res.json({ success: true, message: "User created successfully", user });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/admin/users
router.get("/users", async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "name", "email", "role"],
      order: [["createdAt", "DESC"]]
    });

    res.json(users);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;