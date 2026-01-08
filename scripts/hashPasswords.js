const { User } = require('../models'); // adjust path if needed
const bcrypt = require('bcryptjs');

async function hashAllPasswords() {
  try {
    const users = await User.findAll();

    for (const user of users) {
      // Skip if already hashed (check for $2)
      if (user.password.startsWith('$2')) continue;

      const hashed = await bcrypt.hash(user.password, 10);
      user.password = hashed;
      await user.save();
      console.log(`Password hashed for ${user.email}`);
    }

    console.log('All passwords are now hashed!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

hashAllPasswords();
