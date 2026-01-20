-- Create weight_records table
CREATE TABLE weight_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE RESTRICT,
  weight DECIMAL(5,2) NOT NULL CHECK (weight > 0 AND weight < 500),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX idx_weight_records_participant_id ON weight_records(participant_id);
CREATE INDEX idx_weight_records_recorded_at ON weight_records(recorded_at DESC);
CREATE INDEX idx_weight_records_participant_recorded ON weight_records(participant_id, recorded_at DESC);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_weight_records_updated_at
  BEFORE UPDATE ON weight_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
