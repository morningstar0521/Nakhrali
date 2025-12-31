// Custom error class for API errors
class APIError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

// Error handler middleware
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log error for dev (remove in production)
    if (process.env.NODE_ENV === 'development') {
        console.error('Error:', err);
    }

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = new APIError(message, 404);
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const message = 'Duplicate field value entered';
        error = new APIError(message, 400);
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message);
        error = new APIError(message, 400);
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token. Please log in again.';
        error = new APIError(message, 401);
    }

    if (err.name === 'TokenExpiredError') {
        const message = 'Your session has expired. Please log in again.';
        error = new APIError(message, 401);
    }

    // PostgreSQL errors
    if (err.code === '23505') {
        const message = 'Duplicate entry. This record already exists.';
        error = new APIError(message, 400);
    }

    if (err.code === '23503') {
        const message = 'Referenced record not found.';
        error = new APIError(message, 400);
    }

    // Don't expose internal errors in production
    const statusCode = error.statusCode || 500;
    const message = error.isOperational || process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Internal server error';

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

// Async handler wrapper to avoid try-catch blocks
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
    APIError,
    errorHandler,
    asyncHandler
};
