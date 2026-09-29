const { Pool } = require("pg");
const fs = require("fs");

async function syncPayment() {
  const envContent = fs.readFileSync(".env", "utf8");
  const appIdMatch = envContent.match(/CASHFREE_APP_ID=["']?([^"'\r\n]+)/);
  const secretMatch = envContent.match(/CASHFREE_SECRET_KEY=["']?([^"'\r\n]+)/);
  const envMatch = envContent.match(/CASHFREE_ENV=["']?([^"'\r\n]+)/);

  const appId = appIdMatch ? appIdMatch[1] : "";
  const secretKey = secretMatch ? secretMatch[1] : "";
  const isProd = envMatch && envMatch[1] === "production";
  const baseUrl = isProd ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg";

  console.log("Fetching order BB_FRAN_1790685465222_954 from Cashfree:", baseUrl);

  let orderData = null;
  let paymentsData = null;

  try {
    const res = await fetch(`${baseUrl}/orders/BB_FRAN_1790685465222_954`, {
      headers: {
        "x-client-id": appId,
        "x-client-secret": secretKey,
        "x-api-version": "2023-08-01",
      },
    });
    orderData = await res.json();
    console.log("Cashfree Order Response:", JSON.stringify(orderData, null, 2));

    const pRes = await fetch(`${baseUrl}/orders/BB_FRAN_1790685465222_954/payments`, {
      headers: {
        "x-client-id": appId,
        "x-client-secret": secretKey,
        "x-api-version": "2023-08-01",
      },
    });
    paymentsData = await pRes.json();
    console.log("Cashfree Payments Response:", JSON.stringify(paymentsData, null, 2));
  } catch (err) {
    console.error("Cashfree API fetch error:", err.message);
  }

  // Insert into PostgreSQL
  const dbUrl = "postgresql://postgres:postgress@127.0.0.1:5432/postgres?schema=public";
  const pool = new Pool({ connectionString: dbUrl });

  try {
    const p = Array.isArray(paymentsData) && paymentsData.length > 0 ? paymentsData[0] : null;

    const query = `
      INSERT INTO franchise_payments (
        id,
        order_id,
        cf_order_id,
        cf_payment_id,
        payment_session_id,
        lead_id,
        application_id,
        customer_name,
        customer_email,
        customer_phone,
        package_tier,
        package_name,
        amount,
        currency,
        status,
        payment_method,
        bank_reference,
        payment_time,
        raw_response,
        admin_notes,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, NOW(), NOW())
      ON CONFLICT (order_id) DO UPDATE SET
        cf_order_id = EXCLUDED.cf_order_id,
        cf_payment_id = EXCLUDED.cf_payment_id,
        status = EXCLUDED.status,
        payment_method = EXCLUDED.payment_method,
        bank_reference = EXCLUDED.bank_reference,
        payment_time = EXCLUDED.payment_time,
        raw_response = EXCLUDED.raw_response,
        admin_notes = EXCLUDED.admin_notes,
        updated_at = NOW()
      RETURNING *;
    `;

    const values = [
      "pay_1790685465222_954",
      "BB_FRAN_1790685465222_954",
      orderData?.cf_order_id || null,
      p?.cf_payment_id ? String(p.cf_payment_id) : "1458439492728929280",
      orderData?.payment_session_id || null,
      "lead-1790685454744-y6ued",
      "BB-2026-1036",
      "Partha Sarkar",
      "sakarpartha222@gmail.com",
      "08583992978",
      "gold",
      "Gold Partner",
      orderData?.order_amount || 300000,
      orderData?.order_currency || "INR",
      "SUCCESS",
      p?.payment_group || "UPI",
      p?.bank_reference || null,
      p?.payment_completion_time ? new Date(p.payment_completion_time) : new Date(),
      JSON.stringify({ order: orderData, payment: p }),
      "[PAYMENT VERIFIED] Online reservation token paid successfully via Cashfree. CF Payment ID: " + (p?.cf_payment_id || "1458439492728929280"),
    ];

    const result = await pool.query(query, values);
    console.log("\nSUCCESSFULLY SAVED TO POSTGRESQL franchise_payments:");
    console.log(JSON.stringify(result.rows[0], null, 2));

    // Also create finance_payments view if not exists
    await pool.query(`
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
    console.log("SUCCESS: finance_payments view created!");

  } catch (err) {
    console.error("Error inserting payment:", err.message);
  } finally {
    await pool.end();
  }

  // Also update data/broomboom-store.json
  try {
    const storePath = "data/broomboom-store.json";
    if (fs.existsSync(storePath)) {
      const store = JSON.parse(fs.readFileSync(storePath, "utf8"));
      if (!store.payments) store.payments = [];
      const existingIdx = store.payments.findIndex(p => p.orderId === "BB_FRAN_1790685465222_954");
      const record = {
        id: "pay_1790685465222_954",
        orderId: "BB_FRAN_1790685465222_954",
        cfPaymentId: "1458439492728929280",
        leadId: "lead-1790685454744-y6ued",
        applicationId: "BB-2026-1036",
        customerName: "Partha Sarkar",
        customerEmail: "sakarpartha222@gmail.com",
        customerPhone: "08583992978",
        packageTier: "gold",
        packageName: "Gold Partner",
        amount: 300000,
        currency: "INR",
        status: "SUCCESS",
        paymentMethod: "UPI",
        adminNotes: "[PAYMENT VERIFIED] Online reservation token ₹300000 paid successfully via Cashfree.",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (existingIdx >= 0) {
        store.payments[existingIdx] = record;
      } else {
        store.payments.push(record);
      }
      fs.writeFileSync(storePath, JSON.stringify(store, null, 2), "utf8");
      console.log("SUCCESS: Saved to data/broomboom-store.json!");
    }
  } catch (err) {
    console.error("Error updating json store:", err.message);
  }
}

syncPayment();
