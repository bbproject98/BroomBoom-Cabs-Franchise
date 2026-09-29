const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const envPath = path.join(__dirname, '..', '.env');
let databaseUrl = "postgresql://durgapuja_user:DURGAPUJA%401%232026@167.71.224.67:5432/durgapuja_db?schema=public";
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  const match = content.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
  if (match && match[1]) databaseUrl = match[1];
}

const pool = new Pool({ connectionString: databaseUrl });

async function syncLeads() {
  const client = await pool.connect();
  const storePath = path.join(__dirname, '..', 'data', 'broomboom-store.json');
  const storeData = JSON.parse(fs.readFileSync(storePath, 'utf8'));
  const leads = storeData.leads || [];

  console.log(`Syncing ${leads.length} leads to franchise_leads table...`);

  const query = `
    INSERT INTO franchise_leads (
      id, application_id, full_name, mobile, alternate_phone, email,
      state, city, pincode, proposed_address, space_status, carpet_area,
      preferred_package, package_name, investment_budget, finance_required,
      loan_assistance, current_profession, has_experience, message,
      source, status, admin_notes, created_at, updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
      $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
      $21, $22, $23, $24, $25
    )
    ON CONFLICT (application_id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      mobile = EXCLUDED.mobile,
      email = EXCLUDED.email,
      city = EXCLUDED.city,
      status = EXCLUDED.status,
      updated_at = EXCLUDED.updated_at;
  `;

  for (const l of leads) {
    const values = [
      l.id || `lead-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      l.applicationId,
      l.fullName,
      l.mobile,
      l.alternatePhone || null,
      l.email || '',
      l.state || 'West Bengal',
      l.city || 'Kolkata',
      l.pincode || null,
      l.proposedAddress || null,
      l.spaceStatus || null,
      l.carpetArea || null,
      l.preferredPackage || 'gold',
      l.packageName || 'Gold Partner',
      l.investmentBudget || null,
      l.financeRequired || 'Self-Funded',
      l.loanAssistance || 'No',
      l.currentProfession || null,
      l.hasExperience || null,
      l.message || null,
      l.source || 'apply_page',
      l.status || 'new',
      l.adminNotes || null,
      new Date(l.createdAt || Date.now()),
      new Date(l.updatedAt || Date.now()),
    ];

    try {
      await client.query(query, values);
    } catch (e) {
      console.warn(`Could not sync ${l.applicationId}:`, e.message);
    }
  }

  const res = await client.query("SELECT COUNT(*) FROM franchise_leads");
  console.log(`franchise_leads now contains ${res.rows[0].count} records!`);

  client.release();
  await pool.end();
}

syncLeads().catch(console.error);

