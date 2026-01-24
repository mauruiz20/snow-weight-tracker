-- Add target_weight column to participants table
-- This is optional (nullable) - participants can set a weight goal
ALTER TABLE participants
ADD COLUMN target_weight NUMERIC(5, 2) DEFAULT NULL;
