-- Migration to add gift_occasions table
CREATE TABLE IF NOT EXISTS gift_occasions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image VARCHAR(500) NOT NULL,
    filter_tag VARCHAR(100), -- The value to filter products by (e.g. 'Anniversary')
    active BOOLEAN DEFAULT true,
    "order" INTEGER DEFAULT 0,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_gift_occasions_active ON gift_occasions(active);
CREATE INDEX IF NOT EXISTS idx_gift_occasions_order ON gift_occasions("order");

-- Trigger for updated_at
CREATE OR REPLACE TRIGGER update_gift_occasions_updated_at BEFORE UPDATE ON gift_occasions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
