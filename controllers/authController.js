const db = require('../models');
const User = db.User;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { logEvent } = require('../services/auditLogger');

exports.login = async (req, res) => {
  const { email, password } = req.body;

  console.log('🔍 Login attempt for:', email);

  // 1️⃣ Validate input
  if (!email || !password) {
    console.log('❌ Missing email or password');
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    console.log('📊 Searching for user in database...');
    console.log('User model available:', !!User);
    
    // 2️⃣ Find user by email ONLY
    const user = await User.findOne({
      where: { email: email.toLowerCase() }
    });

    console.log('👤 User found:', user ? `YES (${user.email})` : 'NO');

    if (!user) {
      console.log('❌ User not found');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('🔐 Comparing passwords...');
    
    // 3️⃣ Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    
    console.log('🔑 Password match:', isMatch);
    
    if (!isMatch) {
      console.log('❌ Password mismatch');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('🎫 Generating JWT token...');

    // 4️⃣ Generate token using DB role
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    console.log('✅ Login successful for:', user.email);

    await logEvent({
      userId: user.id,
      eventType: 'LOGIN_SUCCESS',
      method: req.method,
      path: req.originalUrl,
      req,
    });

    // 5️⃣ Respond
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error('❌ LOGIN ERROR DETAILS:');
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'role', 'district'],
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (err) {
    console.error('Error fetching current user:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
