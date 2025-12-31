const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const { connectDB } = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// CORS must be configured FIRST (before other middleware)
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware (needs to be early in the stack)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security Middleware
// Set security headers with proper CSP
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:", "http://localhost:5001"],
            scriptSrc: ["'self'"],
            connectSrc: ["'self'", "http://localhost:5001", "http://localhost:5173"],
        },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Note: XSS protection is handled via input sanitization in controllers
// (removing HTML tags with .replace(/<[^>]*>/g, '')) instead of using xss-clean
// which has compatibility issues with Express 5

// Rate limiting - relaxed for development, tighten for production
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: process.env.NODE_ENV === 'production' ? 100 : 500, // 500 for dev, 100 for production
    message: { success: false, message: 'Too many requests from this IP, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', limiter);

// More strict rate limiting for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 5 : 20, // 20 for dev, 5 for production
    message: { success: false, message: 'Too many login attempts, please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Sanitize data - Disabled for PostgreSQL (mongo-sanitize is for MongoDB)
// Since we're using PostgreSQL with parameterized queries, we don't need this
// app.use(mongoSanitize());

// Prevent parameter pollution
app.use(hpp());

// Serve static files (uploads) - with CORS headers
app.use('/uploads', cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}), express.static('uploads'));

// Serve profile uploads separately with same CORS
app.use('/uploads/profiles', cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}), express.static('uploads/profiles'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/banners', require('./routes/banners'));
app.use('/api/occasions', require('./routes/occasions'));
app.use('/api/boxes', require('./routes/boxes'));
app.use('/api/hampers', require('./routes/hampers'));
app.use('/api/search', require('./routes/search'));
app.use('/api/user', require('./routes/user'));
app.use('/api/admin', require('./routes/admin'));

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'Nakhrali Fashion API',
        version: '1.0.0',
        status: 'healthy'
    });
});

// 404 handler for undefined routes
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

// Global error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
