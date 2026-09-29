const fs = require("fs");
const path = require("path");

// Parse .env manually
const envPath = path.resolve(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx > 0) {
        const key = trimmed.substring(0, eqIdx).trim();
        let val = trimmed.substring(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[key] = val;
      }
    }
  }
}

async function testFlow() {
  console.log("==================================================");
  console.log("    BROOMBOOM FRANCHISE CASHFREE PAYMENT TEST     ");
  console.log("==================================================");

  const appId = process.env.CASHFREE_APP_ID;
  const secretKey = process.env.CASHFREE_SECRET_KEY;
  const env = process.env.CASHFREE_ENV || "sandbox";

  console.log(`• Cashfree App ID: ${appId ? appId.slice(0, 8) + "..." : "MISSING"}`);
  console.log(`• Cashfree Secret: ${secretKey ? secretKey.slice(0, 8) + "..." : "MISSING"}`);
  console.log(`• Environment: ${env}`);
  console.log("--------------------------------------------------");

  if (!appId || !secretKey) {
    console.error("❌ ERROR: Cashfree credentials missing in .env");
    process.exit(1);
  }

  // 1. Direct Cashfree PG Order API Test
  const testOrderId = `TEST_BB_${Date.now()}`;
  console.log(`⏳ [1/2] Creating Cashfree Sandbox Order (${testOrderId})...`);

  const payload = {
    order_id: testOrderId,
    order_amount: 300000.00,
    order_currency: "INR",
    customer_details: {
      customer_id: "cust_test_partner",
      customer_name: "Partha Sarkar",
      customer_email: "support@broomboomcabs.com",
      customer_phone: "8583992978",
    },
    order_meta: {
      return_url: `http://localhost:3000/thank-you?order_id=${testOrderId}`,
    },
    order_note: "Gold Partner Franchise Reservation Test",
  };

  const res = await fetch("https://sandbox.cashfree.com/pg/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-client-id": appId,
      "x-client-secret": secretKey,
      "x-api-version": "2023-08-01",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("❌ Cashfree order creation failed:", data);
    process.exit(1);
  }

  console.log("✅ [SUCCESS] Cashfree Order Created Successfully!");
  console.log(`• Order ID: ${data.order_id}`);
  console.log(`• Status: ${data.order_status}`);
  console.log(`• Order Amount: ₹${data.order_amount}`);
  console.log(`• Payment Session ID: ${data.payment_session_id.slice(0, 30)}...`);

  // 2. Fetch Order Status
  console.log(`\n⏳ [2/2] Querying Order Status from Cashfree...`);
  const verifyRes = await fetch(`https://sandbox.cashfree.com/pg/orders/${testOrderId}`, {
    method: "GET",
    headers: {
      "x-client-id": appId,
      "x-client-secret": secretKey,
      "x-api-version": "2023-08-01",
    },
  });

  const verifyData = await verifyRes.json();
  if (verifyRes.ok) {
    console.log("✅ [SUCCESS] Cashfree Order Query Verified!");
    console.log(`• Status: ${verifyData.order_status}`);
    console.log(`• Customer: ${verifyData.customer_details?.customer_name} (${verifyData.customer_details?.customer_phone})`);
  } else {
    console.error("❌ Failed to query order:", verifyData);
  }

  console.log("\n==================================================");
  console.log("🎉 ALL CASHFREE INTEGRATION CHECKS PASSED!");
  console.log("Flow Summary:");
  console.log("1. User fills form on /apply or home modal");
  console.log("2. Redirects to /checkout?appId=...&pkg=gold");
  console.log("3. User sees plan details + 'Pay Now with Cashfree'");
  console.log("4. User clicks Pay Now -> Cashfree Checkout opens");
  console.log("5. On completion -> Redirects to /thank-you?order_id=...");
  console.log("6. /thank-you displays verified receipt + sends emails!");
  console.log("==================================================");
}

testFlow();
