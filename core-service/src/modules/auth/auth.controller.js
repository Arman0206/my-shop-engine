const authService = require('./auth.service');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;
const MAX_PASSWORD = 72; // bcrypt ignores bytes past 72

const validateCredentials = ({ email, password }) => {
  if (typeof email !== 'string' || !EMAIL_RE.test(email) || email.length > 254) return 'A valid email is required';
  if (typeof password !== 'string' || password.length < MIN_PASSWORD) return `Password must be at least ${MIN_PASSWORD} characters`;
  if (Buffer.byteLength(password) > MAX_PASSWORD) return `Password must be at most ${MAX_PASSWORD} bytes`;
  return null;
};

const register = async (req, res, next) => {
  try {
    const problem = validateCredentials(req.body);
    if (problem) return res.status(400).json({ message: problem });
    const name = typeof req.body.name === 'string' ? req.body.name.slice(0, 100) : '';
    const result = await authService.register({ email: req.body.email, password: req.body.password, name });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    res.json(await authService.login({ email, password }));
  } catch (error) {
    next(error);
  }
};

const me = async (req, res, next) => {
  try {
    const user = await authService.getUserById(req.user.id);
    if (!user) return res.status(401).json({ message: 'Account no longer exists' });
    res.json(authService.publicUser(user));
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, me };
