-- Sales Reports Table
CREATE TABLE IF NOT EXISTS sales_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL,
  offer_id UUID NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'generating', 'complete', 'archived')),
  content TEXT,
  metadata JSONB DEFAULT '{}',
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Offer Files Table
CREATE TABLE IF NOT EXISTS offer_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL,
  offer_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  storage_path TEXT NOT NULL,
  extraction_status TEXT NOT NULL CHECK (extraction_status IN ('pending', 'processing', 'complete', 'failed')),
  extracted_content TEXT,
  summary TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Offer Contexts Table
CREATE TABLE IF NOT EXISTS offer_contexts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL,
  product_name TEXT NOT NULL,
  category TEXT NOT NULL,
  target_audience TEXT NOT NULL,
  main_problem TEXT NOT NULL,
  key_features JSONB DEFAULT '[]',
  price_point TEXT NOT NULL,
  geographic_focus TEXT NOT NULL,
  usp TEXT NOT NULL,
  additional_context TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- File Access Grants Table
CREATE TABLE IF NOT EXISTS file_access_grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  offer_id UUID NOT NULL,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  download_count INTEGER DEFAULT 0,
  max_downloads INTEGER DEFAULT 3,
  last_downloaded_at TIMESTAMP WITH TIME ZONE
);

-- Report Versions Table
CREATE TABLE IF NOT EXISTS report_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES sales_reports(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sales_reports_workspace ON sales_reports(workspace_id);
CREATE INDEX IF NOT EXISTS idx_sales_reports_offer ON sales_reports(offer_id);
CREATE INDEX IF NOT EXISTS idx_sales_reports_status ON sales_reports(status);

CREATE INDEX IF NOT EXISTS idx_offer_files_workspace ON offer_files(workspace_id);
CREATE INDEX IF NOT EXISTS idx_offer_files_offer ON offer_files(offer_id);
CREATE INDEX IF NOT EXISTS idx_offer_files_extraction_status ON offer_files(extraction_status);

CREATE INDEX IF NOT EXISTS idx_offer_contexts_workspace ON offer_contexts(workspace_id);

CREATE INDEX IF NOT EXISTS idx_file_access_email ON file_access_grants(email);
CREATE INDEX IF NOT EXISTS idx_file_access_offer ON file_access_grants(offer_id);

CREATE INDEX IF NOT EXISTS idx_report_versions_report ON report_versions(report_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_sales_reports_updated_at BEFORE UPDATE ON sales_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_offer_files_updated_at BEFORE UPDATE ON offer_files
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_offer_contexts_updated_at BEFORE UPDATE ON offer_contexts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
