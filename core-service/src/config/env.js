// Fail fast on missing/weak secrets instead of running with an insecure default.
const requireJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    console.error('JWT_SECRET must be set and at least 32 characters long.');
    console.error('Generate one: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"');
    process.exit(1);
  }
  return secret;
};

module.exports = { requireJwtSecret };
