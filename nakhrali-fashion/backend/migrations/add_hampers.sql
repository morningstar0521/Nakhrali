-- Create hampers table
CREATE TABLE IF NOT EXISTS hampers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    occasion_id UUID,
    box_id UUID,
    image VARCHAR(500),
    total_price DECIMAL(10, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (occasion_id) REFERENCES gift_occasions(id) ON DELETE SET NULL,
    FOREIGN KEY (box_id) REFERENCES gift_boxes(id) ON DELETE SET NULL
);

-- Create hamper_products junction table (for many-to-many relationship)
CREATE TABLE IF NOT EXISTS hamper_products (
    id SERIAL PRIMARY KEY,
    hamper_id UUID NOT NULL,
    product_id UUID NOT NULL,
    quantity INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hamper_id) REFERENCES hampers(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE (hamper_id, product_id)
);

-- Create updated_at trigger for hampers
CREATE OR REPLACE FUNCTION update_hampers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_hampers_updated_at
    BEFORE UPDATE ON hampers
    FOR EACH ROW
    EXECUTE FUNCTION update_hampers_updated_at();
