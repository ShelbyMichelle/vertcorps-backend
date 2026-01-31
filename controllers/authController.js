exports.login = async (req, res) => {
  const { email, password } = req.body;

  console.log('🔍 Login attempt:', { email });

  // 1️⃣ Validate input
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    console.log('📊 Attempting to find user in database...');
    
    // 2️⃣ Find user by email ONLY
    const user = await User.findOne({
      where: { email: email.toLowerCase() }
    });

    console.log('👤 User found:', user ? 'YES' : 'NO');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('🔐 Comparing passwords...');
    
    // 3️⃣ Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    
    console.log('🔑 Password match:', isMatch);
    
    if (!isMatch) {
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
    console.error('❌ LOGIN ERROR:', err);
    console.error('Error details:', {
      message: err.message,
      stack: err.stack
    });
    res.status(500).json({ message: 'Server error' });
  }
};