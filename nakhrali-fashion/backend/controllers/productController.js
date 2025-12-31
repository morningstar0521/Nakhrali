const { pool } = require('../config/db');

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
exports.getFeaturedProducts = async (req, res) => {
    const client = await pool.connect();
    try {
        const query = `
            SELECT 
                p.*,
                json_build_object('id', u.id, 'full_name', u.full_name, 'email', u.email) as created_by_user
            FROM products p
            LEFT JOIN users u ON p.created_by = u.id
            WHERE p.featured = true
            ORDER BY p.created_at DESC
            LIMIT 8
        `;

        const result = await client.query(query);

        // Transform the data to match frontend expectations
        const products = result.rows.map(row => ({
            id: row.id,
            name: row.name,
            description: row.description,
            price: parseFloat(row.price),
            salePrice: row.sale_price ? parseFloat(row.sale_price) : null,
            category: row.category,
            images: row.images || [],
            stock: row.stock,
            featured: row.featured,
            tags: row.tags || [],
            material: row.material || '',
            dimensions: row.dimensions || '',
            colors: row.colors || [],
            customFields: row.custom_fields || {},
            createdBy: row.created_by_user,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        }));

        res.status(200).json({
            success: true,
            count: products.length,
            products
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

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
    const client = await pool.connect();
    try {
        const query = `
            SELECT 
                p.*,
                json_build_object('id', u.id, 'full_name', u.full_name, 'email', u.email) as created_by_user
            FROM products p
            LEFT JOIN users u ON p.created_by = u.id
            ORDER BY p.created_at DESC
        `;

        const result = await client.query(query);

        // Transform the data to match frontend expectations
        const products = result.rows.map(row => ({
            id: row.id,
            name: row.name,
            description: row.description,
            price: parseFloat(row.price),
            salePrice: row.sale_price ? parseFloat(row.sale_price) : null,
            category: row.category,
            images: row.images || [],
            stock: row.stock,
            featured: row.featured,
            tags: row.tags || [],
            material: row.material || '',
            dimensions: row.dimensions || '',
            colors: row.colors || [],
            customFields: row.custom_fields || {},
            createdBy: row.created_by_user,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        }));

        res.status(200).json({
            success: true,
            count: products.length,
            products
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

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res) => {
    const client = await pool.connect();
    try {
        const query = `
            SELECT 
                p.*,
                json_build_object('id', u.id, 'full_name', u.full_name, 'email', u.email) as created_by_user
            FROM products p
            LEFT JOIN users u ON p.created_by = u.id
            WHERE p.id = $1
        `;

        const result = await client.query(query, [req.params.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const row = result.rows[0];
        const product = {
            id: row.id,
            name: row.name,
            description: row.description,
            price: parseFloat(row.price),
            salePrice: row.sale_price ? parseFloat(row.sale_price) : null,
            category: row.category,
            images: row.images || [],
            stock: row.stock,
            featured: row.featured,
            tags: row.tags || [],
            material: row.material || '',
            dimensions: row.dimensions || '',
            colors: row.colors || [],
            customFields: row.custom_fields || {},
            createdBy: row.created_by_user,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };

        res.status(200).json({
            success: true,
            product
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

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
    const client = await pool.connect();
    try {
        const { name, description, price, salePrice, category, images, stock, featured, tags, material, dimensions, colors, customFields } = req.body;

        const query = `
            INSERT INTO products (name, description, price, sale_price, category, images, stock, featured, tags, material, dimensions, colors, custom_fields, created_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            RETURNING *
        `;

        const result = await client.query(query, [
            name,
            description,
            price,
            salePrice || null,
            category,
            JSON.stringify(images || []),
            stock || 0,
            featured || false,
            JSON.stringify(tags || []),
            material || '',
            dimensions || '',
            JSON.stringify(colors || []),
            JSON.stringify(customFields || {}),
            req.user.id
        ]);

        const row = result.rows[0];
        const product = {
            id: row.id,
            name: row.name,
            description: row.description,
            price: parseFloat(row.price),
            salePrice: row.sale_price ? parseFloat(row.sale_price) : null,
            category: row.category,
            images: row.images || [],
            stock: row.stock,
            featured: row.featured,
            tags: row.tags || [],
            material: row.material || '',
            dimensions: row.dimensions || '',
            colors: row.colors || [],
            customFields: row.custom_fields || {},
            createdBy: req.user.id,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };

        res.status(201).json({
            success: true,
            product
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

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
    const client = await pool.connect();
    try {
        // Check if product exists
        const checkQuery = 'SELECT id FROM products WHERE id = $1';
        const checkResult = await client.query(checkQuery, [req.params.id]);

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const { name, description, price, salePrice, category, images, stock, featured, tags, material, dimensions, colors, customFields } = req.body;

        const query = `
            UPDATE products
            SET name = COALESCE($1, name),
                description = COALESCE($2, description),
                price = COALESCE($3, price),
                sale_price = $4,
                category = COALESCE($5, category),
                images = COALESCE($6, images),
                stock = COALESCE($7, stock),
                featured = COALESCE($8, featured),
                tags = COALESCE($9, tags),
                material = COALESCE($10, material),
                dimensions = COALESCE($11, dimensions),
                colors = COALESCE($12, colors),
                custom_fields = COALESCE($13, custom_fields)
            WHERE id = $14
            RETURNING *
        `;

        const result = await client.query(query, [
            name,
            description,
            price,
            salePrice || null,
            category,
            images ? JSON.stringify(images) : null,
            stock,
            featured,
            tags ? JSON.stringify(tags) : null,
            material,
            dimensions,
            colors ? JSON.stringify(colors) : null,
            customFields ? JSON.stringify(customFields) : null,
            req.params.id
        ]);

        const row = result.rows[0];
        const product = {
            id: row.id,
            name: row.name,
            description: row.description,
            price: parseFloat(row.price),
            salePrice: row.sale_price ? parseFloat(row.sale_price) : null,
            category: row.category,
            images: row.images || [],
            stock: row.stock,
            featured: row.featured,
            tags: row.tags || [],
            material: row.material || '',
            dimensions: row.dimensions || '',
            colors: row.colors || [],
            customFields: row.custom_fields || {},
            createdBy: row.created_by,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };

        res.status(200).json({
            success: true,
            product
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

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
    const client = await pool.connect();
    try {
        const query = 'DELETE FROM products WHERE id = $1 RETURNING id';
        const result = await client.query(query, [req.params.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Product deleted successfully'
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

// @desc    Upload product images
// @route   POST /api/products/upload
// @access  Private/Admin
exports.uploadImages = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please upload at least one image'
            });
        }

        // Generate URLs for uploaded files
        const imageUrls = req.files.map(file => `/uploads/products/${file.filename}`);

        res.status(200).json({
            success: true,
            images: imageUrls
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete product image
// @route   DELETE /api/products/images/:filename
// @access  Private/Admin
exports.deleteImage = async (req, res) => {
    const fs = require('fs');
    const path = require('path');

    try {
        const { filename } = req.params;
        const filePath = path.join(__dirname, '../uploads/products', filename);

        // Check if file exists
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            res.status(200).json({
                success: true,
                message: 'Image deleted successfully'
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Image not found'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
