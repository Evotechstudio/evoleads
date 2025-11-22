-- ============================================
-- FINAL CLEAN SETUP FOR LEAD GENERATION
-- This script drops all unnecessary tables and creates only what's needed
-- ============================================

-- STEP 1: Drop all existing tables (in correct order to avoid foreign key issues)
-- ============================================

DROP TABLE IF EXISTS export_templates CASCADE;
DROP TABLE IF EXISTS bulk_actions CASCADE;
DROP TABLE IF EXISTS usage_records CASCADE;
DROP TABLE IF EXISTS search_alerts CASCADE;
DROP TABLE IF EXISTS saved_searches CASCADE;
DROP TABLE IF EXISTS lead_tag_assignments CASCADE;
DROP TABLE IF EXISTS lead_tags CASCADE;
DROP TABLE IF EXISTS lead_metadata CASCADE;
DROP TABLE IF EXISTS billing_history CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS user_searches CASCADE;
DROP TABLE IF EXISTS organization_members CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
DROP TABLE IF EXISTS plans CASCADE;
DROP TABLE IF EXISTS serp_cache CASCADE;
DROP TABLE IF EXISTS user_plans CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS clean_expired_serp_cache() CASCADE;
DROP FUNCTION IF EXISTS reset_monthly_usage() CASCADE;
DROP FUNCTION IF EXISTS get_monthly_usage(UUID) CASCADE;

-- ============================================
-- STEP 2: Create only essential tables
-- ============================================

-- Profiles table (for Clerk users)
CREATE TABLE profiles (
  id TEXT PRIMARY KEY, -- Clerk user ID
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User plans table (track usage per user)
CREATE TABLE user_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  plan_name TEXT DEFAULT 'free' CHECK (plan_name IN ('free', 'starter')),
  search_requests_used INTEGER DEFAULT 0,
  leads_used INTEGER DEFAULT 0,
  period_start TIMESTAMP WITH TIME ZONE DEFAULT date_trunc('month', NOW()),
  period_end TIMESTAMP WITH TIME ZONE DEFAULT (date_trunc('month', NOW()) + INTERVAL '1 month'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User searches table (track search history)
CREATE TABLE user_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_type TEXT NOT NULL,
  country TEXT NOT NULL,
  state TEXT NOT NULL,
  city TEXT,
  leads_requested INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leads table (store generated leads)
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  search_id UUID NOT NULL REFERENCES user_searches(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  website TEXT,
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SERP cache table (cache Google search results)
CREATE TABLE serp_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  search_query TEXT NOT NULL,
  country TEXT NOT NULL,
  state TEXT,
  business_type TEXT NOT NULL,
  results JSONB NOT NULL,
  result_count INTEGER DEFAULT 0,
  cached_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  UNIQUE(search_query, country, state, business_type)
);

-- Lead metadata table (additional lead information)
CREATE TABLE lead_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL UNIQUE REFERENCES leads(id) ON DELETE CASCADE,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT,
  rating DECIMAL(2,1),
  review_count INTEGER,
  google_maps_url TEXT,
  place_id TEXT,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- STEP 3: Create indexes for performance
-- ============================================

CREATE INDEX idx_user_plans_user_id ON user_plans(user_id);
CREATE INDEX idx_user_searches_user_id ON user_searches(user_id);
CREATE INDEX idx_user_searches_created ON user_searches(created_at);
CREATE INDEX idx_leads_search_id ON leads(search_id);
CREATE INDEX idx_leads_email ON leads(email) WHERE email IS NOT NULL;
CREATE INDEX idx_leads_created ON leads(created_at);
CREATE INDEX idx_serp_cache_query ON serp_cache(search_query, country, business_type);
CREATE INDEX idx_serp_cache_expires ON serp_cache(expires_at);
CREATE INDEX idx_lead_metadata_lead_id ON lead_metadata(lead_id);

-- ============================================
-- STEP 4: Enable Row Level Security
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE serp_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_metadata ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 5: Create RLS Policies (Allow all for simplicity)
-- ============================================

-- Profiles policies
CREATE POLICY "Allow all operations on profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);

-- User plans policies
CREATE POLICY "Allow all operations on user_plans" ON user_plans FOR ALL USING (true) WITH CHECK (true);

-- User searches policies
CREATE POLICY "Allow all operations on user_searches" ON user_searches FOR ALL USING (true) WITH CHECK (true);

-- Leads policies
CREATE POLICY "Allow all operations on leads" ON leads FOR ALL USING (true) WITH CHECK (true);

-- SERP cache policies
CREATE POLICY "Allow all operations on serp_cache" ON serp_cache FOR ALL USING (true) WITH CHECK (true);

-- Lead metadata policies
CREATE POLICY "Allow all operations on lead_metadata" ON lead_metadata FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- STEP 6: Create helper functions
-- ============================================

-- Function to clean expired cache
CREATE OR REPLACE FUNCTION clean_expired_serp_cache()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM serp_cache WHERE expires_at < NOW();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset monthly usage (run on 1st of each month)
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE user_plans
  SET 
    search_requests_used = 0,
    leads_used = 0,
    period_start = date_trunc('month', NOW()),
    period_end = date_trunc('month', NOW()) + INTERVAL '1 month'
  WHERE period_end < NOW();
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user stats
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id TEXT)
RETURNS TABLE (
  total_searches BIGINT,
  total_leads BIGINT,
  searches_this_month INTEGER,
  leads_this_month INTEGER,
  plan_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT us.id) as total_searches,
    COUNT(l.id) as total_leads,
    COALESCE(up.search_requests_used, 0) as searches_this_month,
    COALESCE(up.leads_used, 0) as leads_this_month,
    COALESCE(up.plan_name, 'free') as plan_name
  FROM profiles p
  LEFT JOIN user_searches us ON us.user_id = p.id
  LEFT JOIN leads l ON l.search_id = us.id
  LEFT JOIN user_plans up ON up.user_id = p.id
  WHERE p.id = p_user_id
  GROUP BY up.search_requests_used, up.leads_used, up.plan_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STEP 7: Insert sample data (optional)
-- ============================================

-- You can uncomment this to add a test user
-- INSERT INTO profiles (id, email, full_name) VALUES 
-- ('test_user_123', 'test@example.com', 'Test User')
-- ON CONFLICT (id) DO NOTHING;

-- INSERT INTO user_plans (user_id, plan_name) VALUES 
-- ('test_user_123', 'free')
-- ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- VERIFICATION
-- ============================================

-- Check tables created
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Check indexes created
SELECT 
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Success message
SELECT 
  '✅ Database setup completed successfully!' as status,
  'Tables created: profiles, user_plans, user_searches, leads, serp_cache, lead_metadata' as tables,
  'Ready to use!' as message;

-- ============================================
-- USAGE EXAMPLES
-- ============================================

-- Example 1: Create a user profile
-- INSERT INTO profiles (id, email, full_name) 
-- VALUES ('clerk_user_id_here', 'user@example.com', 'John Doe');

-- Example 2: Get user stats
-- SELECT * FROM get_user_stats('clerk_user_id_here');

-- Example 3: Clean expired cache
-- SELECT clean_expired_serp_cache();

-- Example 4: Reset monthly usage (run on 1st of month)
-- SELECT reset_monthly_usage();

-- Example 5: View recent searches
-- SELECT * FROM user_searches ORDER BY created_at DESC LIMIT 10;

-- Example 6: View recent leads
-- SELECT l.*, us.business_type, us.country 
-- FROM leads l
-- JOIN user_searches us ON l.search_id = us.id
-- ORDER BY l.created_at DESC LIMIT 10;
