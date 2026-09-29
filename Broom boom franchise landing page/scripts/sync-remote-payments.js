const { Pool } = require("pg");

const remoteUrl = "postgresql://durgapuja_user:DURGAPUJA%401%232026@167.71.224.67:5432/durgapuja_db?schema=public";

async function syncRemote() {
  console.log("Connecting to remote database 167.71.224.67...");
  const pool = new Pool({ connectionString: remoteUrl, connectionTimeoutMillis: 5000 });

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS franchise_payments (
        id VARCHAR(64) PRIMARY KEY,
        order_id VARCHAR(100) UNIQUE NOT NULL,
        cf_order_id VARCHAR(100),
        cf_payment_id VARCHAR(100),
        payment_session_id VARCHAR(255),
        lead_id VARCHAR(64),
        application_id VARCHAR(64),
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(50) NOT NULL,
        package_tier VARCHAR(50) NOT NULL,
        package_name VARCHAR(150),
        amount NUMERIC(12, 2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'INR',
        status VARCHAR(50) DEFAULT 'PENDING',
        payment_method VARCHAR(100),
        bank_reference VARCHAR(150),
        payment_time TIMESTAMPTZ,
        raw_response TEXT,
        admin_notes TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_remote_payments_order_id ON franchise_payments(order_id);
      CREATE INDEX IF NOT EXISTS idx_remote_payments_cf_payment_id ON franchise_payments(cf_payment_id);
      CREATE INDEX IF NOT EXISTS idx_remote_payments_app_id ON franchise_payments(application_id);
      CREATE INDEX IF NOT EXISTS idx_remote_payments_status ON franchise_payments(status);
      CREATE INDEX IF NOT EXISTS idx_remote_payments_created_at ON franchise_payments(created_at DESC);

      CREATE OR REPLACE VIEW finance_payments AS
      SELECT
        id,
        order_id,
        cf_order_id,
        cf_payment_id,
        application_id,
        customer_name,
        customer_phone,
        customer_email,
        package_tier,
        package_name,
        amount,
        currency,
        status,
        payment_method,
        bank_reference,
        payment_time,
        admin_notes,
        created_at,
        updated_at
      FROM franchise_payments;
    `);
    console.log("Remote table franchise_payments and view finance_payments created!");

    // Insert Partha Sarkar's payment into remote as well
    const query = `
      INSERT INTO franchise_payments (
        id, order_id, cf_order_id, cf_payment_id, payment_session_id,
        lead_id, application_id, customer_name, customer_email, customer_phone,
        package_tier, package_name, amount, currency, status, payment_method,
        bank_reference, payment_time, admin_notes, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, NOW(), NOW())
      ON CONFLICT (order_id) DO UPDATE SET
        cf_payment_id = EXCLUDED.cf_payment_id,
        status = EXCLUDED.status,
        amount = EXCLUDED.amount,
        admin_notes = EXCLUDED.admin_notes,
        updated_at = NOW()
      RETURNING *;
    `;

    const values = [
      "pay_1790685465222_954",
      "BB_FRAN_1790685465222_954",
      "1458439469198883840",
      "1458439492728929280",
      "session_wNQ3jBBysROcoZQboWDI7ii2bkkp3tnZJD-F-zrh01b0Jvb3OUwmg3J0EvQwzTVPTvKIoBbj6c-OUWe-ex-jSCLlSDRyOSykWy_WxjKYCc_ygHYzR3M29HV3gakpayment",
      "lead-1790685454744-y6ued",
      "BB-2026-1036",
      "Partha Sarkar",
      "sakarpartha222@gmail.com",
      "08583992978",
      "gold",
      "Gold Partner",
      300000,
      "INR",
      "SUCCESS",
      "net_banking",
      "1458439492728929280",
      new Date("2026-09-29T18:08:07+05:30"),
      "[PAYMENT VERIFIED] Online reservation token paid successfully via Cashfree. CF Payment ID: 1458439492728929280",
    ];

    const result = await pool.query(query, values);
    console.log("SUCCESS! Saved payment to remote DB:", result.rows[0].order_id, result.rows[0].status, "₹" + result.rows[0].amount);
  } catch (err) {
    console.error("Remote DB error:", err.message);
  } finally {
    await pool.end();
  }
}

syncRemote();
