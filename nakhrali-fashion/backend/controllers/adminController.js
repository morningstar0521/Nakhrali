const { pool } = require('../config/db');

// @desc    Get admin dashboard metrics
// @route   GET /api/admin/metrics
// @access  Private/Admin
exports.getMetrics = async (req, res) => {
    const client = await pool.connect();
    try {
        // Get total users
        const usersResult = await client.query('SELECT COUNT(*) FROM users');
        const totalUsers = parseInt(usersResult.rows[0].count);

        // Get total products
        const productsResult = await client.query('SELECT COUNT(*) FROM products');
        const totalProducts = parseInt(productsResult.rows[0].count);

        // Get total banners
        const bannersResult = await client.query('SELECT COUNT(*) FROM hero_banners');
        const totalBanners = parseInt(bannersResult.rows[0].count);

        // Get active banners
        const activeBannersResult = await client.query('SELECT COUNT(*) FROM hero_banners WHERE active = true');
        const activeBanners = parseInt(activeBannersResult.rows[0].count);

        // Calculate total revenue from orders
        const revenueResult = await client.query('SELECT SUM(total_amount) as revenue FROM orders WHERE status != $1', ['cancelled']);
        const totalRevenue = parseFloat(revenueResult.rows[0].revenue) || 0;

        // Get total orders
        const ordersResult = await client.query('SELECT COUNT(*) FROM orders');
        const totalOrders = parseInt(ordersResult.rows[0].count);

        // Get recent users
        const recentUsersQuery = `
            SELECT id, full_name, email, role, created_at
            FROM users
            ORDER BY created_at DESC
            LIMIT 5
        `;
        const recentUsersResult = await client.query(recentUsersQuery);

        // Get low stock products
        const lowStockQuery = `
            SELECT *
            FROM products
            WHERE stock < 10
            ORDER BY stock ASC
            LIMIT 5
        `;
        const lowStockResult = await client.query(lowStockQuery);

        res.status(200).json({
            success: true,
            metrics: {
                totalUsers,
                totalProducts,
                totalBanners,
                activeBanners,
                totalRevenue,
                totalOrders,
                recentUsers: recentUsersResult.rows,
                lowStockProducts: lowStockResult.rows
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    } finally {
        client.release();
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
    const client = await pool.connect();
    try {
        const query = `
            SELECT id, full_name, email, phone, role, gender, date_of_birth, newsletter, whatsapp, created_at, updated_at
            FROM users
            ORDER BY created_at DESC
        `;
        const result = await client.query(query);

        res.status(200).json({
            success: true,
            count: result.rows.length,
            users: result.rows
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    } finally {
        client.release();
    }
};

// @desc    Get all orders (Admin)
// @route   GET /api/admin/orders
// @access  Private/Admin
exports.getAllOrders = async (req, res) => {
    const client = await pool.connect();
    try {
        const query = `
            SELECT o.*, 
                   u.full_name as user_name,
                   u.email as user_email,
                   json_agg(
                       json_build_object(
                           'id', oi.id,
                           'product_name', oi.product_name,
                           'quantity', oi.quantity,
                           'price', oi.price,
                           'image', oi.image
                       )
                   ) as items
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            LEFT JOIN order_items oi ON o.id = oi.order_id
            GROUP BY o.id, u.full_name, u.email
            ORDER BY o.created_at DESC
        `;
        const result = await client.query(query);

        res.status(200).json({
            success: true,
            count: result.rows.length,
            orders: result.rows
        });
    } catch (error) {
        console.error('Error fetching all orders:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    } finally {
        client.release();
    }
};

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validate status
        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order status'
            });
        }

        const result = await client.query(
            'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Order status updated successfully',
            order: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    } finally {
        client.release();
    }
};
