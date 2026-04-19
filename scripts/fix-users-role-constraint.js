require('dotenv').config();
const { sequelize } = require('../models');

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Refusing to modify constraints in production.');
  }

  await sequelize.authenticate();

  // Legacy constraint left behind from older schema versions (role was validated via CHECK).
  // The column is now an ENUM in the model, so this constraint is unnecessary and can block new roles.
  await sequelize.query('ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;');

  console.log('✅ Dropped constraint public.users.users_role_check (if it existed).');
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

