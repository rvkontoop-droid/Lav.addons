-- Create addons table
CREATE TABLE IF NOT EXISTS addons (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  tags TEXT[],
  author TEXT NOT NULL,
  download_url TEXT,
  preview_url TEXT,
  video_url TEXT,
  downloads INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  entity_name TEXT NOT NULL,
  username TEXT NOT NULL,
  user_id TEXT,
  changes JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_addons_category ON addons(category);
CREATE INDEX IF NOT EXISTS idx_addons_author ON addons(author);
CREATE INDEX IF NOT EXISTS idx_addons_created_at ON addons(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);

-- Enable Row Level Security (RLS)
ALTER TABLE addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access on addons" ON addons
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access on audit_logs" ON audit_logs
  FOR SELECT USING (true);

-- Create policies for authenticated write access
CREATE POLICY "Allow authenticated insert on addons" ON addons
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated update on addons" ON addons
  FOR UPDATE USING (true);

CREATE POLICY "Allow authenticated delete on addons" ON addons
  FOR DELETE USING (true);

CREATE POLICY "Allow authenticated insert on audit_logs" ON audit_logs
  FOR INSERT WITH CHECK (true);
