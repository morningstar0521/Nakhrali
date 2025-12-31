const { pool } = require('../config/db');

// @desc    Get all active banners
// @route   GET /api/banners
// @access  Public
exports.getBanners = async (req, res) => {
    const client = await pool.connect();
    try {
        const query = `
            SELECT * FROM hero_banners
            WHERE active = true
            ORDER BY "order" ASC
        `;

        const result = await client.query(query);

        res.status(200).json({
            success: true,
            count: result.rows.length,
            banners: result.rows
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

// @desc    Get all banners (including inactive) - Admin only
// @route   GET /api/banners/all
// @access  Private/Admin
exports.getAllBanners = async (req, res) => {
    const client = await pool.connect();
    try {
        const query = `
            SELECT 
                b.*,
                json_build_object('id', u.id, 'full_name', u.full_name, 'email', u.email) as created_by_user
            FROM hero_banners b
            LEFT JOIN users u ON b.created_by = u.id
            ORDER BY b."order" ASC
        `;

        const result = await client.query(query);

        const banners = result.rows.map(row => ({
            id: row.id,
            title: row.title,
            subtitle: row.subtitle,
            description: row.description,
            image: row.image,
            redirectLink: row.redirect_link,
            primaryCta: row.primary_cta,
            secondaryCta: row.secondary_cta,
            active: row.active,
            order: row.order,
            createdBy: row.created_by_user,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        }));

        res.status(200).json({
            success: true,
            count: banners.length,
            banners
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

// @desc    Get single banner
// @route   GET /api/banners/:id
// @access  Public
exports.getBanner = async (req, res) => {
    const client = await pool.connect();
    try {
        const query = 'SELECT * FROM hero_banners WHERE id = $1';
        const result = await client.query(query, [req.params.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Banner not found'
            });
        }

        res.status(200).json({
            success: true,
            banner: result.rows[0]
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

// @desc    Create banner
// @route   POST /api/banners
// @access  Private/Admin
exports.createBanner = async (req, res) => {
    const client = await pool.connect();
    try {
        const { title, subtitle, description, image, redirectLink, primaryCta, secondaryCta, active, order } = req.body;

        const query = `
            INSERT INTO hero_banners (title, subtitle, description, image, redirect_link, primary_cta, secondary_cta, active, "order", created_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        `;

        const result = await client.query(query, [
            title,
            subtitle || null,
            description,
            image,
            redirectLink || null,
            primaryCta || 'Shop Now',
            secondaryCta || 'Learn More',
            active !== undefined ? active : true,
            order || 0,
            req.user.id
        ]);

        res.status(201).json({
            success: true,
            banner: result.rows[0]
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

// @desc    Update banner
// @route   PUT /api/banners/:id
// @access  Private/Admin
exports.updateBanner = async (req, res) => {
    const client = await pool.connect();
    try {
        // Check if banner exists
        const checkQuery = 'SELECT id FROM hero_banners WHERE id = $1';
        const checkResult = await client.query(checkQuery, [req.params.id]);

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Banner not found'
            });
        }

        const { title, subtitle, description, image, redirectLink, primaryCta, secondaryCta, active, order } = req.body;

        const query = `
            UPDATE hero_banners
            SET title = COALESCE($1, title),
                subtitle = $2,
                description = COALESCE($3, description),
                image = COALESCE($4, image),
                redirect_link = $5,
                primary_cta = COALESCE($6, primary_cta),
                secondary_cta = COALESCE($7, secondary_cta),
                active = COALESCE($8, active),
                "order" = COALESCE($9, "order")
            WHERE id = $10
            RETURNING *
        `;

        const result = await client.query(query, [
            title,
            subtitle,
            description,
            image,
            redirectLink,
            primaryCta,
            secondaryCta,
            active,
            order,
            req.params.id
        ]);

        res.status(200).json({
            success: true,
            banner: result.rows[0]
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

// @desc    Delete banner
// @route   DELETE /api/banners/:id
// @access  Private/Admin
exports.deleteBanner = async (req, res) => {
    const client = await pool.connect();
    try {
        const query = 'DELETE FROM hero_banners WHERE id = $1 RETURNING id';
        const result = await client.query(query, [req.params.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Banner not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Banner deleted successfully'
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
