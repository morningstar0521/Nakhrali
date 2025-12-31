const bcrypt = require('bcryptjs');
const { pool } = require('./config/db');

async function createAdmin() {
    try {
        const email = 'admin@nakhrali.com';
        // Use environment variable or stronger temporary password
        const password = process.env.ADMIN_PASSWORD || 'TempAdmin2025!@#';
        const fullName = 'Admin';
        const role = 'admin';

        console.log('⚠️  SECURITY: For production, set ADMIN_PASSWORD environment variable.');
        console.log('⚠️  CHANGE THIS PASSWORD immediately after first login!\\n');

        // Hash password with stronger salt rounds
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Check if user already exists
        const existingUser = await pool.query(
            'SELECT id, email FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            console.log('User already exists. Updating to admin role...');
            await pool.query(
                'UPDATE users SET role = $1 WHERE email = $2',
                [role, email]
            );
            console.log('✅ Updated user to admin role');
            console.log('\nAdmin Credentials:');
            console.log('Email:', email);
            console.log('Password: Use ADMIN_PASSWORD env var or TempAdmin2025!@#');
            console.log('⚠️  CHANGE PASSWORD after first login!');
            process.exit(0);
        }

        // Insert new admin user
        const result = await pool.query(
            `INSERT INTO users (email, password, full_name, role) 
             VALUES ($1, $2, $3, $4) 
             RETURNING id, email, full_name, role`,
            [email, hashedPassword, fullName, role]
        );

        console.log('✅ Admin account created successfully!');
        console.log('\nAdmin Credentials:');
        console.log('Email:', email);
        console.log('Password: Use ADMIN_PASSWORD env var or TempAdmin2025!@#');
        console.log('\n⚠️  CRITICAL: Change this password immediately after first login!');
        console.log('⚠️  Never commit passwords to version control!');
        
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
}

createAdmin();
