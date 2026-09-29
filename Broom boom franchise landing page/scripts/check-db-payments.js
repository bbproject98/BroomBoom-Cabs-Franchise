const { Pool } = require("pg");
const fs = require("fs");

// Read .env if exists
let envUrl = "";
if (fs.existsSync(".env")) {
  const envContent = fs.readFileSync(".env", "utf8");
  const match = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)/);
  if (match) envUrl = match[1];
}

const localUrl = envUrl || "postgresql://postgres:postgress@127.0.0.1:5432/postgres?schema=public";
const remoteUrl = "postgresql://durgapuja_user:DURGAPUJA%401%232026@167.71.224.67:5432/durgapuja_db?schema=public";

async function checkDb(name, url) {
  console.log(`\n=== Checking ${name}: ${url.replace(/:[^:]*@/, ":****@")} ===`);
  const pool = new Pool({ connectionString: url, connectionTimeoutMillis: 4000 });
  try {
    const tables = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public'"
    );
    console.log("Tables:", tables.rows.map((r) => r.table_name).join(", "));

    const hasPayTable = tables.rows.some(r => r.table_name === "franchise_payments");
    if (hasPayTable) {
      const payments = await pool.query(
        "SELECT * FROM franchise_payments ORDER BY created_at DESC LIMIT 10"
      );
      console.log(`franchise_payments count: ${payments.rows.length}`);
      payments.rows.forEach(p => console.log(`  Order: ${p.order_id}, Status: ${p.status}, Amount: ₹${p.amount}, Lead: ${p.customer_name} (${p.customer_phone})`));
    } else {
      console.log("franchise_payments table DOES NOT EXIST in this DB!");
    }

    const leads = await pool.query(
      "SELECT id, application_id, full_name, mobile, status, created_at, admin_notes FROM franchise_leads ORDER BY created_at DESC LIMIT 5"
    );
    console.log(`Recent leads count: ${leads.rows.length}`);
    leads.rows.forEach(l => console.log(`  Lead: ${l.application_id} - ${l.full_name}, Status: ${l.status}, Created: ${l.created_at}`));

  } catch (e) {
    console.error(`Error connecting to ${name}:`, e.message);
  } finally {
    await pool.end();
  }
}

async function run() {
  await checkDb("LOCAL DB (.env)", localUrl);
  await checkDb("REMOTE DB (fallback)", remoteUrl);
}

run();
