-- Nakhrali Fashion Database Schema for PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    gender VARCHAR(30) DEFAULT '' CHECK (gender IN ('male', 'female', 'other', 'prefer-not-to-say', '')),
    date_of_birth DATE,
    newsletter BOOLEAN DEFAULT false,
    whatsapp BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    sale_price DECIMAL(10, 2) CHECK (sale_price >= 0),
    category VARCHAR(100) NOT NULL CHECK (category IN (
        'Necklace',
        'Rings',
        'Earrings',
        'Bracelets',
        'Mangalsutra',
        'Pendant Sets',
        'Hair Accessories & Pins',
        'Bangles & Kada',
        'Gift Hampers',
        'Sales'
    )),
    images JSONB DEFAULT '[]',
    stock INTEGER DEFAULT 0 CHECK (stock >= 0),
    featured BOOLEAN DEFAULT false,
    tags JSONB DEFAULT '[]',
    material VARCHAR(255),
    dimensions VARCHAR(255),
    colors JSONB DEFAULT '[]',
    custom_fields JSONB DEFAULT '{}',
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Hero Banners Table
CREATE TABLE IF NOT EXISTS hero_banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    description TEXT NOT NULL,
    image VARCHAR(500) NOT NULL,
    primary_cta VARCHAR(100) DEFAULT 'Shop Now',
    secondary_cta VARCHAR(100) DEFAULT 'Learn More',
    active BOOLEAN DEFAULT true,
    "order" INTEGER DEFAULT 0,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_created_by ON products(created_by);
CREATE INDEX IF NOT EXISTS idx_hero_banners_active ON hero_banners(active);
CREATE INDEX IF NOT EXISTS idx_hero_banners_order ON hero_banners("order");
CREATE INDEX IF NOT EXISTS idx_hero_banners_created_by ON hero_banners(created_by);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE OR REPLACE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_hero_banners_updated_at BEFORE UPDATE ON hero_banners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
