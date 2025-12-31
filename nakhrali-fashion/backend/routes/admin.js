const express = require('express');
const router = express.Router();
const {
    getMetrics,
    getUsers,
    getAllOrders,
    updateOrderStatus
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

// All admin routes require authentication and admin role
router.use(protect);
router.use(admin);

router.get('/metrics', getMetrics);
router.get('/users', getUsers);
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);

module.exports = router;
