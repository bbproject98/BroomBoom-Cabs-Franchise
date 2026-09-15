const { Pool } = require("pg");
const { execSync } = require("child_process");

async function main() {
  const pool = new Pool({
    connectionString: "postgresql://postgres:postgres@localhost:5432/postgres?schema=public"
  });

  console.log("1. Dropping existing view finance_leads before prisma push...");
  await pool.query("DROP VIEW IF EXISTS finance_leads;");
  await pool.end();

  console.log("2. Running prisma db push...");
  const output = execSync("npx prisma db push", { encoding: "utf-8" });
  console.log(output);

  console.log("3. Recreating view finance_leads...");
  const pool2 = new Pool({
    connectionString: "postgresql://postgres:postgres@localhost:5432/postgres?schema=public"
  });
  await pool2.query(`
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
  `);
  console.log("View finance_leads successfully created!");
  await pool2.end();
}

main().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});