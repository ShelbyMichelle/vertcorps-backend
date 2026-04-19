require('dotenv').config();
const bcrypt = require('bcryptjs');
const { User, sequelize } = require('../models');

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Refusing to create default users in production.');
  }

  const email = (process.env.READONLY_EMAIL || 'readonly@vertcorps.com').toLowerCase();
  const name = process.env.READONLY_NAME || 'Read Only User';
  const role = process.env.READONLY_ROLE || 'viewer';
  const password = process.env.READONLY_PASSWORD || 'password123';

  await sequelize.authenticate();

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    console.log(`✅ Read-only user already exists: ${existing.email} (${existing.role})`);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({
    name,
    email,
    password: hashedPassword,
    role,
    district: null,
  });

  console.log(`✅ Created read-only user: ${email} (${role})`);
}

main()
  .then(async () => {
    await sequelize.close();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error('❌', err.message || err);
    try {
      await sequelize.close();
    } catch {}
    process.exit(1);
  });

