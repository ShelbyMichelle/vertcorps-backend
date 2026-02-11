require('dotenv').config();
const bcrypt = require('bcryptjs');
const { User, sequelize } = require('../models');

async function createTestUsers() {
  try {
    console.log('🔌 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Check if users already exist
    const existingUsers = await User.findAll();
    if (existingUsers.length > 0) {
      console.log('⚠️  Users already exist. Skipping creation.');
      existingUsers.forEach(u => {
        console.log(`   - ${u.email} (${u.role})`);
      });
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create test users
    const users = await User.bulkCreate([
      {
        name: 'Admin User',
        email: 'admin@vertcorps.com',
        password: hashedPassword,
        role: 'admin',
        district: null
      },
      {
        name: 'District EDO Lilongwe',
        email: 'edo.lilongwe@vertcorps.com',
        password: hashedPassword,
        role: 'district_EDO',
        district: 'Lilongwe'
      },
      {
        name: 'District EDO Blantyre',
        email: 'edo.blantyre@vertcorps.com',
        password: hashedPassword,
        role: 'district_EDO',
        district: 'Blantyre'
      },
      {
        name: 'Reviewer User',
        email: 'reviewer@vertcorps.com',
        password: hashedPassword,
        role: 'reviewer',
        district: null
      }
    ]);

    console.log('\n✅ Test users created successfully!\n');
    console.log('Login credentials (all users have the same password):');
    console.log('==========================================');
    users.forEach(u => {
      console.log(`📧 Email: ${u.email}`);
      console.log(`👤 Role: ${u.role}`);
      console.log(`🔑 Password: password123`);
      console.log('------------------------------------------');
    });

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

createTestUsers();