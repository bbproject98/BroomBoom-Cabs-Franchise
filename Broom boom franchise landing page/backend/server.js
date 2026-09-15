const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Path to shared persistent database
const DATA_DIR = path.resolve(__dirname, "../data");
const DB_FILE = path.join(DATA_DIR, "broomboom-store.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readDb() {
  ensureDataDir();
  if (!fs.existsSync(DB_FILE)) {
    const initial = {
      leads: [],
      brochures: [],
      hubs: [],
      auditLogs: [],
      version: 1,
    };
    writeDb(initial);
    return initial;
  }
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
  } catch (e) {
    console.error("DB read error:", e);
    return { leads: [], brochures: [], hubs: [], auditLogs: [], version: 1 };
  }
}

function writeDb(state) {
  ensureDataDir();
  const tmp = `${DB_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2), "utf-8");
  fs.renameSync(tmp, DB_FILE);
}

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "BroomBoom Franchise REST API",
    timestamp: new Date().toISOString(),
  });
});

// --- LEADS / APPLICATIONS ---
app.get("/api/leads", (req, res) => {
  const db = readDb();
  const { status, package: pkg, query } = req.query;
  let results = [...db.leads];

  if (status && status !== "all") {
    results = results.filter((l) => l.status === status);
  }
  if (pkg && pkg !== "all") {
    results = results.filter((l) => l.preferredPackage === pkg);
  }
  if (query) {
    const q = query.toLowerCase().trim();
    results = results.filter(
      (l) =>
        l.fullName.toLowerCase().includes(q) ||
        l.city.toLowerCase().includes(q) ||
        l.mobile.includes(q) ||
        l.applicationId.toLowerCase().includes(q)
    );
  }

  results.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  res.json({ success: true, total: results.length, leads: results });
});

app.get("/api/leads/:id", (req, res) => {
  const db = readDb();
  const lead = db.leads.find(
    (l) => l.id === req.params.id || l.applicationId === req.params.id
  );
  if (!lead) return res.status(404).json({ success: false, error: "Lead not found" });
  res.json({ success: true, lead });
});

const handleCreateLead = (req, res) => {
  const body = req.body;
  if (!body.fullName || !body.mobile || !body.city) {
    return res.status(400).json({
      success: false,
      error: "Full Name, Mobile Number, and City are required.",
    });
  }

  const db = readDb();
  const now = new Date().toISOString();
  const serial = 1000 + db.leads.length + 1;
  const applicationId = `BB-2026-${serial}`;
  const id = `lead-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  const newLead = {
    id,
    applicationId,
    fullName: body.fullName.trim(),
    mobile: body.mobile.trim(),
    alternatePhone: body.alternatePhone || "",
    email: body.email || "",
    state: body.state || "",
    city: body.city.trim(),
    pincode: body.pincode || "",
    proposedAddress: body.proposedAddress || "",
    spaceStatus: body.spaceStatus || "",
    carpetArea: body.carpetArea || "",
    preferredPackage: body.preferredPackage || body.selectedPackage || "gold",
    packageName: body.packageName || "Gold Partner",
    investmentBudget: body.investmentBudget || "Flexible",
    currentProfession: body.currentProfession || "",
    hasExperience: body.hasExperience || "",
    message: body.message || "",
    source: body.source || "api",
    status: "new",
    adminNotes: "Application submitted via REST endpoint.",
    createdAt: now,
    updatedAt: now,
  };

  db.leads.unshift(newLead);
  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    action: "LEAD_CREATED",
    details: `Application ${applicationId} submitted by ${newLead.fullName}`,
    timestamp: now,
  });

  writeDb(db);

  res.json({
    success: true,
    message: "Franchise application recorded successfully",
    data: { applicationId, leadId: id, applicant: newLead.fullName },
  });
};

app.post("/api/leads", handleCreateLead);
app.post("/api/apply", handleCreateLead);

app.patch("/api/leads/:id", (req, res) => {
  const db = readDb();
  const idx = db.leads.findIndex(
    (l) => l.id === req.params.id || l.applicationId === req.params.id
  );
  if (idx === -1) return res.status(404).json({ success: false, error: "Lead not found" });

  const updated = {
    ...db.leads[idx],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };

  db.leads[idx] = updated;
  writeDb(db);
  res.json({ success: true, lead: updated });
});

app.delete("/api/leads/:id", (req, res) => {
  const db = readDb();
  const initial = db.leads.length;
  db.leads = db.leads.filter(
    (l) => l.id !== req.params.id && l.applicationId !== req.params.id
  );
  if (db.leads.length === initial) {
    return res.status(404).json({ success: false, error: "Lead not found" });
  }
  writeDb(db);
  res.json({ success: true, message: "Lead deleted successfully" });
});

// --- BROCHURE TRACKING ---
app.get("/api/brochure", (req, res) => {
  const db = readDb();
  res.json({ success: true, total: db.brochures.length, brochures: db.brochures });
});

app.post("/api/brochure", (req, res) => {
  const { name, mobile, city } = req.body;
  if (!name || !mobile) {
    return res.status(400).json({ success: false, error: "Name and Mobile required" });
  }

  const db = readDb();
  const item = {
    id: `brochure-${Date.now()}`,
    name: name.trim(),
    mobile: mobile.trim(),
    city: city?.trim() || "Unspecified",
    downloadedAt: new Date().toISOString(),
  };

  db.brochures.unshift(item);
  writeDb(db);
  res.json({ success: true, message: "Brochure download logged", data: item });
});

// --- STORE HUBS ---
app.get("/api/hubs", (req, res) => {
  const db = readDb();
  res.json({ success: true, total: db.hubs.length, hubs: db.hubs });
});

app.post("/api/hubs", (req, res) => {
  const { city, state, address, tier, type, phone, openHours } = req.body;
  if (!city || !state || !address) {
    return res.status(400).json({ success: false, error: "City, State, and Address required" });
  }

  const db = readDb();
  const newHub = {
    id: `hub-${Date.now()}`,
    city: city.trim(),
    state: state.trim(),
    type: type || "District Fleet Hub",
    tier: tier || "Gold",
    address: address.trim(),
    phone: phone || "1800-BROOM-BOOM",
    openHours: openHours || "9:00 AM - 8:00 PM",
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  db.hubs.push(newHub);
  writeDb(db);
  res.json({ success: true, hub: newHub });
});

app.delete("/api/hubs/:id", (req, res) => {
  const db = readDb();
  const init = db.hubs.length;
  db.hubs = db.hubs.filter((h) => h.id !== req.params.id);
  if (db.hubs.length === init) {
    return res.status(404).json({ success: false, error: "Hub not found" });
  }
  writeDb(db);
  res.json({ success: true, message: "Hub deleted" });
});

// --- ANALYTICS ---
app.get("/api/analytics", (req, res) => {
  const db = readDb();
  const leads = db.leads;

  const packageBreakdown = {
    silver: leads.filter((l) => l.preferredPackage === "silver").length,
    gold: leads.filter((l) => l.preferredPackage === "gold").length,
    platinum: leads.filter((l) => l.preferredPackage === "platinum").length,
    undecided: leads.filter((l) => l.preferredPackage === "undecided").length,
  };

  res.json({
    success: true,
    stats: {
      totalLeads: leads.length,
      approvedLeads: leads.filter((l) => l.status === "approved").length,
      totalBrochureDownloads: db.brochures.length,
      activeHubsCount: db.hubs.filter((h) => h.isActive).length,
      packageBreakdown,
      recentActivity: db.auditLogs.slice(0, 8),
    },
  });
});

app.listen(PORT, () => {
  console.log(`[BROOMBOOM BACKEND] Standalone REST API running on http://localhost:${PORT}`);
});

