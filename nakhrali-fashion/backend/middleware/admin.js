// Admin middleware - check if user is admin
// Whitelist of admin emails for additional security
const ADMIN_EMAILS = [
    'admin@nakhralifashion.com',
    'shubhghiya@gmail.com',
    'admin@nakhrali.com' // Admin account
];

exports.admin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required.'
        });
    }

    // Check if user has admin role AND is in the whitelist
    if (req.user.role === 'admin' && ADMIN_EMAILS.includes(req.user.email)) {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
    }
};
