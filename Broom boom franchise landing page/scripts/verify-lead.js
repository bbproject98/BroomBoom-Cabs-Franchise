const { Pool } = require("pg");
const pool = new Pool({ connectionString: "postgresql://postgres:postgres@localhost:5432/postgres?schema=public" });

async function check() {
  const res = await pool.query("SELECT application_id, full_name, city, preferred_package, finance_required, loan_assistance FROM finance_leads WHERE application_id = 'BB-2026-1010'");
  console.log("PostgreSQL finance_leads Record:", res.rows);
  await pool.end();
}
check();