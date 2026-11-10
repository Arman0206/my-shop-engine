const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./user.model');

const BCRYPT_COST = 12;
const TOKEN_TTL = process.env.JWT_EXPIRES_IN || '2h';

// A real bcrypt hash of a random string. When the email is unknown we still
// run a compare against this, so "no such user" and "wrong password" take the
// same time (no user enumeration through response timing).
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', BCRYPT_COST);

const httpError = (statusCode, message) => Object.assign(new Error(message), { statusCode });

const signToken = (user) =>
  jwt.sign({ role: user.role }, process.env.JWT_SECRET, {
    subject: String(user._id),
    expiresIn: TOKEN_TTL,
    algorithm: 'HS256'
  });

const publicUser = (user) => ({ id: String(user._id), email: user.email, name: user.name, role: user.role });

const register = async ({ email, password, name }) => {
  const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
  try {
    // role is NEVER taken from the request: self-registration always yields 'user'.
    const user = await User.create({ email, name, passwordHash, role: 'user' });
    return { token: signToken(user), user: publicUser(user) };
  } catch (error) {
    if (error.code === 11000) throw httpError(409, 'An account with this email already exists');
    throw error;
  }
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select('+passwordHash');
  const ok = await bcrypt.compare(password, user ? user.passwordHash : DUMMY_HASH);
  if (!user || !ok) throw httpError(401, 'Invalid email or password');
  return { token: signToken(user), user: publicUser(user) };
};

const getUserById = (id) => User.findById(id);

module.exports = { register, login, getUserById, publicUser };
