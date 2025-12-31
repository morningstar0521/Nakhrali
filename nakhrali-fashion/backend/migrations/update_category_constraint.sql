-- Update products category constraint to ensure Sales is included
-- Drop the old constraint
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_check;

-- Add the updated constraint with Sales included
ALTER TABLE products ADD CONSTRAINT products_category_check 
CHECK (category IN (
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
));
