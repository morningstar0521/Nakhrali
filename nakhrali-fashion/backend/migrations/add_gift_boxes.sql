-- Migration to add gift_boxes table
CREATE TABLE IF NOT EXISTS gift_boxes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    image VARCHAR(500),
    dimensions VARCHAR(255),
    color VARCHAR(100),
    material VARCHAR(255),
    stock INTEGER DEFAULT 0 CHECK (stock >= 0),
    active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_gift_boxes_active ON gift_boxes(active);

-- Trigger for updated_at
CREATE OR REPLACE TRIGGER update_gift_boxes_updated_at BEFORE UPDATE ON gift_boxes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
