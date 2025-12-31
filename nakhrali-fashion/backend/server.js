const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const { connectDB } = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');

// Load env vars
dotenv.config();

// Connect DB
connectDB();

const app = express();

/* ======================================================
   CORS — MUST BE FIRST
====================================================== */
const allowedOrigins = [
  'https://nakhrali-liart.vercel.app',
  'https://nakhrali-git-main-morningstar0521s-projects.vercel.app',
  'https://*.vercel.app',
  'http://localhost:5173'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.some(o => origin.includes(o.replace('*.', '')))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 🔥 REQUIRED FOR PREFLIGHT
app.options('*', cors());

/* ======================================================
   BODY PARSER
====================================================== */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/* ======================================================
   HELMET — CSP FIXED FOR VERCEL + RENDER
====================================================== */
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: [
        "'self'",
        "https://nakhrali-fyev.onrender.com",
        "https://nakhrali-liart.vercel.app",
        "https://*.vercel.app",
        "http://localhost:5173"
      ]
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

/* ======================================================
   RATE LIMITING
====================================================== */
const apiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 500,
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api', apiLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 5 : 20,
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

/* ======================================================
   SECURITY
====================================================== */
app.use(hpp());

/* ======================================================
   STATIC FILES
====================================================== */
app.use('/uploads', express.static('uploads'));
app.use('/uploads/profiles', express.static('uploads/profiles'));

/* ======================================================
   ROUTES
====================================================== */
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/banners', require('./routes/banners'));
app.use('/api/occasions', require('./routes/occasions'));
app.use('/api/boxes', require('./routes/boxes'));
app.use('/api/hampers', require('./routes/hampers'));
app.use('/api/search', require('./routes/search'));
app.use('/api/user', require('./routes/user'));
app.use('/api/admin', require('./routes/admin'));

/* ======================================================
   HEALTH CHECK
====================================================== */
app.get('/', (req, res) => {
  res.json({
    message: 'Nakhrali Fashion API',
    version: '1.0.0',
    status: 'healthy'
  });
});

/* ======================================================
   404 + ERROR HANDLER
====================================================== */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

app.use(errorHandler);

/* ======================================================
   START SERVER
====================================================== */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} on port ${PORT}`);
});
