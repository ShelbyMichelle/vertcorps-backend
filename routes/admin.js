const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const { User } = require("../models"); // Sequelize User model

//  ADD USER
router.post("/add-user", async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Hash the password
    const hashed = await bcrypt.hash(password, 10);

    // Create user in PostgreSQL using Sequelize
    const [user, created] = await User.findOrCreate({
      where: { email }, // check if email already exists
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

//  GET USERS
router.get("/users", async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "name", "email", "role"], // select specific columns
      order: [["createdAt", "DESC"]]             // order by createdAt desc
    });

    res.json(users);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
