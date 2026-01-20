-- Enable Row Level Security on all tables
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Participants RLS Policies
-- Public can read all participants
CREATE POLICY "Allow public read access to participants"
  ON participants FOR SELECT
  TO anon
  USING (true);

-- Public can insert new participants
CREATE POLICY "Allow public insert access to participants"
  ON participants FOR INSERT
  TO anon
  WITH CHECK (true);

-- Public can update participants
CREATE POLICY "Allow public update access to participants"
  ON participants FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- NO DELETE policy for participants (deletion is denied)

-- Weight Records RLS Policies
-- Public can read all weight records
CREATE POLICY "Allow public read access to weight_records"
  ON weight_records FOR SELECT
  TO anon
  USING (true);

-- Public can insert weight records
CREATE POLICY "Allow public insert access to weight_records"
  ON weight_records FOR INSERT
  TO anon
  WITH CHECK (true);

-- Public can update weight records
CREATE POLICY "Allow public update access to weight_records"
  ON weight_records FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Public can delete weight records
CREATE POLICY "Allow public delete access to weight_records"
  ON weight_records FOR DELETE
  TO anon
  USING (true);

-- Audit Logs RLS Policies
-- Only service role can read audit logs (no public access)
-- No SELECT policy for anon means no read access

-- Only service role can insert audit logs (via Edge Function)
CREATE POLICY "Allow service role insert access to audit_logs"
  ON audit_logs FOR INSERT
  TO service_role
  WITH CHECK (true);

-- No UPDATE or DELETE policies for audit logs (immutable)

-- Enable realtime for participants and weight_records tables
ALTER PUBLICATION supabase_realtime ADD TABLE participants;
ALTER PUBLICATION supabase_realtime ADD TABLE weight_records;
