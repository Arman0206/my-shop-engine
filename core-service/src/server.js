require('dotenv').config();
const { requireJwtSecret } = require('./config/env');
requireJwtSecret(); // exits with a clear message if JWT_SECRET is missing or weak

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5001;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`core-service running on port ${PORT}`);
  });
});
