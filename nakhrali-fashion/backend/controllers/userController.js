const { pool } = require('../config/db');

// Get user profile
exports.getProfile = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, email, full_name, phone, profile_picture, created_at FROM users WHERE id = $1',
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, user: result.rows[0] });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const { full_name, phone, profile_picture } = req.body;

        // Validate and sanitize inputs
        if (!full_name || full_name.trim().length < 2) {
            return res.status(400).json({ 
                success: false, 
                message: 'Full name must be at least 2 characters' 
            });
        }

        // Validate phone if provided
        if (phone && !/^\d{10}$/.test(phone)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Phone number must be 10 digits' 
            });
        }

        // Sanitize full_name (remove any HTML tags)
        const sanitizedName = full_name.trim().replace(/<[^>]*>/g, '');

        const result = await pool.query(
            'UPDATE users SET full_name = $1, phone = $2, profile_picture = $3 WHERE id = $4 RETURNING id, email, full_name, phone, profile_picture, created_at',
            [sanitizedName, phone || null, profile_picture || null, req.user.id]
        );

        res.json({ 
            success: true, 
            message: 'Profile updated successfully',
            user: result.rows[0] 
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get user addresses
exports.getAddresses = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC',
            [req.user.id]
        );

        res.json({ success: true, addresses: result.rows });
    } catch (error) {
        console.error('Error fetching addresses:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Add new address
exports.addAddress = async (req, res) => {
    try {
        const { name, phone, address_line1, address_line2, city, state, pincode, is_default } = req.body;

        // Validate required fields
        if (!name || !phone || !address_line1 || !city || !state || !pincode) {
            return res.status(400).json({ 
                success: false, 
                message: 'All address fields except address line 2 are required' 
            });
        }

        // Validate phone format
        if (!/^\d{10}$/.test(phone)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Phone number must be 10 digits' 
            });
        }

        // Validate pincode format
        if (!/^\d{6}$/.test(pincode)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Pincode must be 6 digits' 
            });
        }

        // Sanitize inputs (remove HTML tags)
        const sanitizedName = name.trim().replace(/<[^>]*>/g, '');
        const sanitizedAddress1 = address_line1.trim().replace(/<[^>]*>/g, '');
        const sanitizedAddress2 = address_line2 ? address_line2.trim().replace(/<[^>]*>/g, '') : null;
        const sanitizedCity = city.trim().replace(/<[^>]*>/g, '');
        const sanitizedState = state.trim().replace(/<[^>]*>/g, '');

        // If this is default, unset other defaults
        if (is_default) {
            await pool.query(
                'UPDATE addresses SET is_default = false WHERE user_id = $1',
                [req.user.id]
            );
        }

        const result = await pool.query(
            `INSERT INTO addresses (user_id, name, phone, address_line1, address_line2, city, state, pincode, is_default)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING *`,
            [req.user.id, sanitizedName, phone, sanitizedAddress1, sanitizedAddress2, sanitizedCity, sanitizedState, pincode, is_default || false]
        );

        res.status(201).json({ 
            success: true, 
            message: 'Address added successfully',
            address: result.rows[0] 
        });
    } catch (error) {
        console.error('Error adding address:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update address
exports.updateAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, address_line1, address_line2, city, state, pincode, is_default } = req.body;

        // Validate required fields
        if (!name || !phone || !address_line1 || !city || !state || !pincode) {
            return res.status(400).json({ 
                success: false, 
                message: 'All address fields except address line 2 are required' 
            });
        }

        // Validate phone format
        if (!/^\d{10}$/.test(phone)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Phone number must be 10 digits' 
            });
        }

        // Validate pincode format
        if (!/^\d{6}$/.test(pincode)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Pincode must be 6 digits' 
            });
        }

        // Sanitize inputs
        const sanitizedName = name.trim().replace(/<[^>]*>/g, '');
        const sanitizedAddress1 = address_line1.trim().replace(/<[^>]*>/g, '');
        const sanitizedAddress2 = address_line2 ? address_line2.trim().replace(/<[^>]*>/g, '') : null;
        const sanitizedCity = city.trim().replace(/<[^>]*>/g, '');
        const sanitizedState = state.trim().replace(/<[^>]*>/g, '');

        // If this is default, unset other defaults
        if (is_default) {
            await pool.query(
                'UPDATE addresses SET is_default = false WHERE user_id = $1 AND id != $2',
                [req.user.id, id]
            );
        }

        const result = await pool.query(
            `UPDATE addresses 
             SET name = $1, phone = $2, address_line1 = $3, address_line2 = $4, 
                 city = $5, state = $6, pincode = $7, is_default = $8
             WHERE id = $9 AND user_id = $10
             RETURNING *`,
            [sanitizedName, phone, sanitizedAddress1, sanitizedAddress2, sanitizedCity, sanitizedState, pincode, is_default, id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }

        res.json({ 
            success: true, 
            message: 'Address updated successfully',
            address: result.rows[0] 
        });
    } catch (error) {
        console.error('Error updating address:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Delete address
exports.deleteAddress = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM addresses WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }

        res.json({ success: true, message: 'Address deleted successfully' });
    } catch (error) {
        console.error('Error deleting address:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get user orders
exports.getOrders = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT o.*, 
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
             LEFT JOIN order_items oi ON o.id = oi.order_id
             WHERE o.user_id = $1
             GROUP BY o.id
             ORDER BY o.created_at DESC`,
            [req.user.id]
        );

        res.json({ success: true, orders: result.rows });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get single order details
exports.getOrderDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const orderResult = await pool.query(
            'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
            [id, req.user.id]
        );

        if (orderResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        const itemsResult = await pool.query(
            'SELECT * FROM order_items WHERE order_id = $1',
            [id]
        );

        res.json({ 
            success: true, 
            order: {
                ...orderResult.rows[0],
                items: itemsResult.rows
            }
        });
    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Create order
exports.createOrder = async (req, res) => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        const { items, shipping_address, billing_address, total_amount, shipping_cost, tax_amount } = req.body;

        // Create order
        const orderResult = await client.query(
            `INSERT INTO orders (user_id, total_amount, shipping_cost, tax_amount, status, 
                                shipping_address, billing_address)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [req.user.id, total_amount, shipping_cost, tax_amount, 'pending', 
             JSON.stringify(shipping_address), JSON.stringify(billing_address)]
        );

        const orderId = orderResult.rows[0].id;

        // Create order items
        for (const item of items) {
            await client.query(
                `INSERT INTO order_items (order_id, product_id, product_name, quantity, price, image)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [orderId, item.id, item.name, item.quantity, item.price, item.image]
            );
        }

        await client.query('COMMIT');

        res.status(201).json({ 
            success: true, 
            message: 'Order created successfully',
            order: orderResult.rows[0]
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating order:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    } finally {
        client.release();
    }
};
