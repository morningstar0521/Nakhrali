-- Add profile_picture column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS profile_picture TEXT;

-- Add comment to column
COMMENT ON COLUMN users.profile_picture IS 'URL or path to user profile picture';
