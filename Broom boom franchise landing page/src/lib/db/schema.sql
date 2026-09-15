-- ==========================================================
-- BroomBoom Franchise & Finance Leads PostgreSQL Schema
-- Database: postgres (or user_data)
-- ==========================================================

-- 1. Franchise Leads Core Table
CREATE TABLE IF NOT EXISTS franchise_leads (
  id VARCHAR(64) PRIMARY KEY,
  application_id VARCHAR(64) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  mobile VARCHAR(50) NOT NULL,
  alternate_phone VARCHAR(50),
  email VARCHAR(255) NOT NULL,
  state VARCHAR(100),
  city VARCHAR(100) NOT NULL,
  pincode VARCHAR(20),
  proposed_address TEXT,
  space_status VARCHAR(100),
  carpet_area VARCHAR(100),
  preferred_package VARCHAR(50) NOT NULL,
  package_name VARCHAR(150),
  investment_budget VARCHAR(100),
  finance_required VARCHAR(100) DEFAULT 'Self-Funded',
  loan_assistance VARCHAR(50) DEFAULT 'No',
  current_profession VARCHAR(150),
  has_experience VARCHAR(150),
  message TEXT,
  source VARCHAR(50) DEFAULT 'apply_page',
  status VARCHAR(50) DEFAULT 'new',
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_franchise_leads_app_id ON franchise_leads(application_id);
CREATE INDEX IF NOT EXISTS idx_franchise_leads_status ON franchise_leads(status);
CREATE INDEX IF NOT EXISTS idx_franchise_leads_city ON franchise_leads(city);
CREATE INDEX IF NOT EXISTS idx_franchise_leads_package ON franchise_leads(preferred_package);
CREATE INDEX IF NOT EXISTS idx_franchise_leads_created_at ON franchise_leads(created_at DESC);

-- 3. Finance Leads View (Structured for Finance / Accounting / Credit Assessment Team)
CREATE OR REPLACE VIEW finance_leads AS
SELECT
  id,
  application_id,
  full_name,
  mobile,
  email,
  city,
  state,
  preferred_package,
  package_name,
  investment_budget,
  finance_required,
  loan_assistance,
  space_status,
  carpet_area,
  current_profession,
  status,
  created_at,
  updated_at
FROM franchise_leads;
