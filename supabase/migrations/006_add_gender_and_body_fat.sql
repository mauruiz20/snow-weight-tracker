-- Add gender column to participants table
-- Default to 'male' for existing participants
ALTER TABLE participants
ADD COLUMN gender TEXT NOT NULL DEFAULT 'male'
CHECK (gender IN ('male', 'female'));

-- Drop the existing view first (required when adding new columns)
DROP VIEW IF EXISTS participant_rankings;

-- Recreate the participant_rankings view with gender and body fat
CREATE VIEW participant_rankings AS
WITH latest_weights AS (
  SELECT DISTINCT ON (participant_id)
    participant_id,
    weight as latest_weight,
    recorded_at as latest_recorded_at
  FROM weight_records
  ORDER BY participant_id, recorded_at DESC
),
weight_stats AS (
  SELECT
    participant_id,
    MIN(weight) as min_weight,
    MAX(weight) as max_weight,
    COUNT(*) as total_records
  FROM weight_records
  GROUP BY participant_id
)
SELECT
  p.id,
  p.name,
  p.age,
  p.gender,
  p.initial_weight,
  p.height,
  p.created_at,
  COALESCE(lw.latest_weight, p.initial_weight) as current_weight,
  lw.latest_recorded_at,
  -- Weight difference (negative = weight loss, positive = weight gain)
  COALESCE(lw.latest_weight, p.initial_weight) - p.initial_weight as weight_diff,
  -- Weight loss percentage (positive = lost weight, negative = gained weight)
  CASE
    WHEN p.initial_weight > 0 THEN
      ROUND(((p.initial_weight - COALESCE(lw.latest_weight, p.initial_weight)) / p.initial_weight * 100)::numeric, 2)
    ELSE 0
  END as weight_loss_percentage,
  ws.min_weight,
  ws.max_weight,
  COALESCE(ws.total_records, 0) as total_records,
  -- BMI calculation (weight in kg, height in cm)
  CASE
    WHEN p.height > 0 THEN
      ROUND((COALESCE(lw.latest_weight, p.initial_weight) / ((p.height / 100) ^ 2))::numeric, 2)
    ELSE NULL
  END as current_bmi,
  -- Body fat percentage using Deurenberg formula
  -- BF% = (1.20 × BMI) + (0.23 × Age) - (10.8 × Sex) - 5.4
  CASE
    WHEN p.height > 0 THEN
      ROUND((
        (1.20 * (COALESCE(lw.latest_weight, p.initial_weight) / ((p.height / 100) ^ 2)))
        + (0.23 * p.age)
        - (10.8 * CASE WHEN p.gender = 'male' THEN 1 ELSE 0 END)
        - 5.4
      )::numeric, 1)
    ELSE NULL
  END as body_fat_percentage
FROM participants p
LEFT JOIN latest_weights lw ON p.id = lw.participant_id
LEFT JOIN weight_stats ws ON p.id = ws.participant_id
ORDER BY weight_diff ASC; -- Best weight loss first (most negative)
