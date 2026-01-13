const bcrypt = require("bcryptjs")
const { User } = require("../models")

exports.addUser = async (req, res) => {
  const { name, email, password, role } = req.body

  if (!name || !email || !password || !role) {
    return res.status(400).json({ success: false, message: "All fields required" })
  }

  try {
    const existing = await User.findOne({ where: { email } })
    if (existing) {
      return res.status(409).json({ success: false, message: "Email already exists" })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
    })

    res.status(201).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: "Server error" })
  }
}
