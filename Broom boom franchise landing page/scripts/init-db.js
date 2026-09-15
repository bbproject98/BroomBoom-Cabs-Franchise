const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Read DATABASE_URL from .env if present
const envPath = path.join(__dirname, '..', '.env');
let databaseUrl = "postgresql://postgres:postgres@localhost:5432/postgres?schema=public";

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  const match = content.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
  if (match && match[1]) {
    databaseUrl = match[1];
  }
}

const pool = new Pool({ connectionString: databaseUrl });

async function init() {
  console.log(`Connecting to PostgreSQL via: ${databaseUrl.replace(/:[^:@]+@/, ':****@')}`);
  const client = await pool.connect();

  const schemaPath = path.join(__dirname, '..', 'src', 'lib', 'db', 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  console.log("Applying schema...");
  await client.query(schemaSql);
  console.log("SUCCESS: franchise_leads table and finance_leads view created/verified in PostgreSQL!");

  const res = await client.query("SELECT COUNT(*) FROM franchise_leads");
  console.log(`Current record count in franchise_leads: ${res.rows[0].count}`);

  client.release();
  await pool.end();
}

init().catch((err) => {
  console.error("Database initialization failed:", err.message);
  process.exit(1);
});

