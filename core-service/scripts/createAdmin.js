/**
 * Create (or promote) an admin account. Self-registration can only make
 * regular users, so this is the only way to get an admin.
 *
 *   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='a-long-passphrase' node scripts/createAdmin.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/modules/auth/user.model');

(async () => {
  const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 8) {
    console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD (min 8 chars).');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI);
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await User.findOneAndUpdate(
    { email: ADMIN_EMAIL.toLowerCase().trim() },
    { $set: { passwordHash, role: 'admin' }, $setOnInsert: { name: 'Admin' } },
    { upsert: true }
  );
  console.log(`Admin ready: ${ADMIN_EMAIL}`);
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
