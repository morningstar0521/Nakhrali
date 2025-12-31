const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const { connectDB } = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');

dotenv.config();
connectDB();

const app = express();

/* =======================
   ✅ CORS — FINAL
======================= */
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

/* =======================
   BODY PARSER
======================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =======================
   HELMET (NO CSP BLOCKING)
======================= */
app.use(helmet({
  crossOriginResourcePolicy: false
}));

/* =======================
   RATE LIMIT
======================= */
app.use('/api', rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 300
}));

app.use(hpp());

/* =======================
   ROUTES
======================= */
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/banners', require('./routes/banners'));
app.use('/api/occasions', require('./routes/occasions'));
app.use('/api/boxes', require('./routes/boxes'));
app.use('/api/hampers', require('./routes/hampers'));
app.use('/api/search', require('./routes/search'));
app.use('/api/user', require('./routes/user'));
app.use('/api/admin', require('./routes/admin'));

app.get('/', (req, res) => {
  res.json({
    message: 'Nakhrali Fashion API',
    status: 'healthy'
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);

