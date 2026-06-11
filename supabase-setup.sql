-- Paul's Property Portal — Supabase Setup
-- Paste this into the Supabase SQL Editor and run it
-- Project: ember-portal (vuzaqdiesojwzptxssex)

-- 1. Work Orders table
CREATE TABLE IF NOT EXISTS work_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  tenant_name TEXT NOT NULL,
  unit_address TEXT NOT NULL,
  issue_title TEXT NOT NULL,
  issue_description TEXT NOT NULL,
  location_in_property TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
  photo_urls TEXT[] DEFAULT '{}',
  notes TEXT DEFAULT ''
);

-- 2. Notification Recipients table
CREATE TABLE IF NOT EXISTS notification_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT DEFAULT '',
  active BOOLEAN DEFAULT TRUE
);

-- 3. Enable RLS
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_recipients ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies - work_orders
CREATE POLICY "Public can insert work orders" ON work_orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can read work orders" ON work_orders
  FOR SELECT USING (true);

CREATE POLICY "Service role can update work orders" ON work_orders
  FOR UPDATE USING (true);

-- 5. RLS Policies - notification_recipients
CREATE POLICY "Service role full access recipients" ON notification_recipients
  FOR ALL USING (true);

-- 6. Seed first notification recipient (Judd - for testing)
INSERT INTO notification_recipients (name, email, phone, active)
VALUES ('Judd', 'judd@emberseo.ai', '+15129257216', true)
ON CONFLICT DO NOTHING;

-- Done! Now go to Storage > New Bucket, create bucket named: work-order-photos
-- Set it to PUBLIC so photo URLs work in emails.
