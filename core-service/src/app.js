const express = require('express');
const cors = require('cors');
const productRoutes = require('./modules/products/product.routes');
const cartRoutes = require('./modules/cart/cart.routes');
const authRoutes = require('./modules/auth/auth.routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Only the configured frontend origin(s) may call this API from a browser.
// CORS_ORIGIN="https://shop.example.com,https://admin.example.com"
// In development (NODE_ENV != production) the Vite dev server is allowed by default.
const allowedOrigins = (process.env.CORS_ORIGIN || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5173'))
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '100kb' }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'core-service' });
});

app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/cart', cartRoutes);

app.use(errorHandler);

module.exports = app;
