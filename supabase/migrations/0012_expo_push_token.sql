-- Add Expo Push token field to profiles table.
-- Replaces separate fcm_token / apns_token columns used by the previous KMP client.
-- Both old and new columns coexist during the migration window.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS expo_push_token TEXT;
