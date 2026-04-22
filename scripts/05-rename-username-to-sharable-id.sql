-- Migration: Rename username column to sharable_id in profiles table
-- This aligns the app branding with "Sharable ID" instead of "username"

-- Rename username column to sharable_id in profiles table
ALTER TABLE profiles RENAME COLUMN username TO sharable_id;

-- Update the unique constraint name
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_username_key;
ALTER TABLE profiles ADD CONSTRAINT profiles_sharable_id_key UNIQUE (sharable_id);

-- Update any indexes if they exist
DROP INDEX IF EXISTS idx_profiles_username;
CREATE INDEX idx_profiles_sharable_id ON profiles(sharable_id);

-- If communities table has username column, rename it too
ALTER TABLE communities RENAME COLUMN username TO sharable_id;
DROP INDEX IF EXISTS idx_communities_username;
CREATE INDEX idx_communities_sharable_id ON communities(sharable_id);

COMMENT ON COLUMN profiles.sharable_id IS 'User Sharable ID - unique identifier used for sharing and profile links';
