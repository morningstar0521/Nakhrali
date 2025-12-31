-- Migration to add redirect_link column to hero_banners table
-- Run this to add the redirect_link column

ALTER TABLE hero_banners ADD COLUMN IF NOT EXISTS redirect_link VARCHAR(255);

-- Verify column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'hero_banners' 
AND column_name = 'redirect_link';
