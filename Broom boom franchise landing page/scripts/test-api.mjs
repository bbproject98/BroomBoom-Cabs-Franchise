async function runTests() {
  const BASE_URL = "http://localhost:3000";
  console.log("==================================================");
  console.log("   BROOMBOOM FRANCHISE BACKEND VERIFICATION TEST   ");
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;

  async function assertTest(name, fn) {
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name}:`, err.message);
      failed++;
    }
  }

  let createdLeadId = "";
  let createdHubId = "";

  // 1. Check Leads List
  await assertTest("GET /api/leads returns leads list", async () => {
    const res = await fetch(`${BASE_URL}/api/leads`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success || !Array.isArray(data.leads)) throw new Error("Invalid response format");
    if (data.leads.length === 0) throw new Error("Expected at least initial seed leads");
  });

  // 2. Submit New Franchise Application
  await assertTest("POST /api/apply records new lead in database", async () => {
    const payload = {
      fullName: "Automated Test Partner",
      mobile: "+91 99999 88888",
      email: "test.partner@broomboom.com",
      city: "Bhubaneswar",
      state: "Odisha",
      preferredPackage: "gold",
      investmentBudget: "₹5L - ₹10L",
      spaceStatus: "Commercial space ready",
      carpetArea: "400 sq.ft",
      currentProfession: "Fleet Business",
      hasExperience: "Yes, currently in travel",
      message: "Automated verification test run",
      source: "api",
    };

    const res = await fetch(`${BASE_URL}/api/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.data?.applicationId) throw new Error("Missing applicationId");
    createdLeadId = data.data.leadId;
  });

  // 3. Get Single Lead by ID
  await assertTest("GET /api/leads/[id] retrieves created lead", async () => {
    if (!createdLeadId) throw new Error("No lead ID to test");
    const res = await fetch(`${BASE_URL}/api/leads/${createdLeadId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success || data.lead.fullName !== "Automated Test Partner") {
      throw new Error("Lead data mismatch");
    }
  });

  // 4. Update Lead Status
  await assertTest("PATCH /api/leads/[id] updates status to approved", async () => {
    if (!createdLeadId) throw new Error("No lead ID to test");
    const res = await fetch(`${BASE_URL}/api/leads/${createdLeadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "approved", adminNotes: "Verified via automated test script." }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success || data.lead.status !== "approved") {
      throw new Error("Status update failed");
    }
  });

  // 5. Track Brochure Download
  await assertTest("POST /api/brochure records download request", async () => {
    const res = await fetch(`${BASE_URL}/api/brochure`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Downloader",
        mobile: "+91 91111 22222",
        city: "Nagpur",
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.data?.id) throw new Error("Brochure record creation failed");
  });

  // 6. Get Brochure Downloads List
  await assertTest("GET /api/brochure returns download records", async () => {
    const res = await fetch(`${BASE_URL}/api/brochure`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success || !Array.isArray(data.brochures)) throw new Error("Invalid brochure response");
  });

  // 7. Get Hubs List
  await assertTest("GET /api/hubs returns active franchise hubs", async () => {
    const res = await fetch(`${BASE_URL}/api/hubs`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success || !Array.isArray(data.hubs)) throw new Error("Invalid hubs response");
  });

  // 8. Add New Hub
  await assertTest("POST /api/hubs adds new store hub", async () => {
    const res = await fetch(`${BASE_URL}/api/hubs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        city: "Chandigarh",
        state: "Punjab",
        type: "District Fleet Hub",
        tier: "Gold",
        address: "Sector 17 Market Complex",
        phone: "1800-BROOM-BOOM",
        openHours: "9:00 AM - 8:00 PM",
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.hub?.id) throw new Error("Hub creation failed");
    createdHubId = data.hub.id;
  });

  // 9. Clean up created test hub
  await assertTest("DELETE /api/hubs/[id] removes test hub", async () => {
    if (!createdHubId) throw new Error("No hub ID to test");
    const res = await fetch(`${BASE_URL}/api/hubs/${createdHubId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success) throw new Error("Hub delete failed");
  });

  // 10. Analytics Stats
  await assertTest("GET /api/analytics returns accurate metrics", async () => {
    const res = await fetch(`${BASE_URL}/api/analytics`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.stats?.packageBreakdown) throw new Error("Invalid analytics format");
  });

  // 11. CSV Export
  await assertTest("GET /api/export returns valid CSV headers and rows", async () => {
    const res = await fetch(`${BASE_URL}/api/export`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("text/csv")) {
      throw new Error(`Unexpected content type: ${contentType}`);
    }
    const text = await res.text();
    if (!text.includes("Application ID") || !text.includes("Full Name")) {
      throw new Error("CSV missing expected header columns");
    }
  });

  // Clean up created test lead
  if (createdLeadId) {
    await fetch(`${BASE_URL}/api/leads/${createdLeadId}`, { method: "DELETE" });
  }

  console.log("\n==================================================");
  console.log(`TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) process.exit(1);
}

runTests();

