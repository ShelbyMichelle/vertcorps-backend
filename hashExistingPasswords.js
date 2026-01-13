const bcrypt = require("bcryptjs");
const { User } = require("./models");

async function hashPasswords() {
  const users = await User.findAll();

  for (const user of users) {
    // Skip if already hashed
    if (user.password.startsWith("$2")) {
      console.log(`✔ ${user.email} already hashed`);
      continue;
    }

    const hashed = await bcrypt.hash(user.password, 10);
    user.password = hashed;
    await user.save();

    console.log(`🔐 Hashed password for ${user.email}`);
  }

  console.log("✅ Password hashing completed");
  process.exit(0);
}

hashPasswords().catch(err => {
  console.error(err);
  process.exit(1);
});
