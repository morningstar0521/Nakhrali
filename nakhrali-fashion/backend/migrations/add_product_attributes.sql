-- Migration to add product attribute columns
-- Run this to add material, dimensions, colors, and custom_fields columns to products table

ALTER TABLE products ADD COLUMN IF NOT EXISTS material VARCHAR(255);
ALTER TABLE products ADD COLUMN IF NOT EXISTS dimensions VARCHAR(255);
ALTER TABLE products ADD COLUMN IF NOT EXISTS colors JSONB DEFAULT '[]';
ALTER TABLE products ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}';

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('material', 'dimensions', 'colors', 'custom_fields');
