import { Pool } from "pg";
import { FranchiseLead, PackageTier, LeadStatus } from "./schema";

function getConnectionString(): string {
  return (
    process.env.DATABASE_URL ||
    "postgresql://durgapuja_user:DURGAPUJA%401%232026@167.71.224.67:5432/durgapuja_db?schema=public"
  );
}

let pool: Pool | null = null;

export function getPostgresPool(): Pool {
  if (!pool) {
    const connectionString = getConnectionString();
    pool = new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    pool.on("error", (err) => {
      console.error("[POSTGRES ERROR] Unexpected idle client error:", err.message);
    });
  }
  return pool;
}

let tableInitialized = false;

export async function initPostgresDb(): Promise<boolean> {
  if (tableInitialized) return true;
  try {
    const client = getPostgresPool();
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS franchise_leads (
        id VARCHAR(64) PRIMARY KEY,
        application_id VARCHAR(64) UNIQUE NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        mobile VARCHAR(50) NOT NULL,
        alternate_phone VARCHAR(50),
        email VARCHAR(255) NOT NULL,
        state VARCHAR(100),
        city VARCHAR(100) NOT NULL,
        pincode VARCHAR(20),
        proposed_address TEXT,
        space_status VARCHAR(100),
        carpet_area VARCHAR(100),
        preferred_package VARCHAR(50) NOT NULL,
        package_name VARCHAR(150),
        investment_budget VARCHAR(100),
        finance_required VARCHAR(100) DEFAULT 'Self-Funded',
        loan_assistance VARCHAR(50) DEFAULT 'No',
        current_profession VARCHAR(150),
        has_experience VARCHAR(150),
        message TEXT,
        source VARCHAR(50) DEFAULT 'apply_page',
        status VARCHAR(50) DEFAULT 'new',
        admin_notes TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_franchise_leads_status ON franchise_leads(status);
      CREATE INDEX IF NOT EXISTS idx_franchise_leads_city ON franchise_leads(city);
      CREATE INDEX IF NOT EXISTS idx_franchise_leads_app_id ON franchise_leads(application_id);
      CREATE INDEX IF NOT EXISTS idx_franchise_leads_created_at ON franchise_leads(created_at DESC);

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
    `;

    await client.query(createTableQuery);
    tableInitialized = true;
    console.log("[POSTGRES] franchise_leads table & finance_leads view verified and ready.");
    return true;
  } catch (err: any) {
    console.warn("[POSTGRES WARNING] Failed to initialize table:", err.message);
    return false;
  }
}

export async function saveFranchiseLeadToPostgres(
  lead: FranchiseLead
): Promise<FranchiseLead | null> {
  try {
    await initPostgresDb();
    const client = getPostgresPool();

    const query = `
      INSERT INTO franchise_leads (
        id,
        application_id,
        full_name,
        mobile,
        alternate_phone,
        email,
        state,
        city,
        pincode,
        proposed_address,
        space_status,
        carpet_area,
        preferred_package,
        package_name,
        investment_budget,
        finance_required,
        loan_assistance,
        current_profession,
        has_experience,
        message,
        source,
        status,
        admin_notes,
        created_at,
        updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
        $21, $22, $23, $24, $25
      )
      ON CONFLICT (application_id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        mobile = EXCLUDED.mobile,
        alternate_phone = EXCLUDED.alternate_phone,
        email = EXCLUDED.email,
        state = EXCLUDED.state,
        city = EXCLUDED.city,
        pincode = EXCLUDED.pincode,
        proposed_address = EXCLUDED.proposed_address,
        space_status = EXCLUDED.space_status,
        carpet_area = EXCLUDED.carpet_area,
        preferred_package = EXCLUDED.preferred_package,
        package_name = EXCLUDED.package_name,
        investment_budget = EXCLUDED.investment_budget,
        finance_required = EXCLUDED.finance_required,
        loan_assistance = EXCLUDED.loan_assistance,
        current_profession = EXCLUDED.current_profession,
        has_experience = EXCLUDED.has_experience,
        message = EXCLUDED.message,
        status = EXCLUDED.status,
        admin_notes = EXCLUDED.admin_notes,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    const values = [
      lead.id,
      lead.applicationId,
      lead.fullName,
      lead.mobile,
      lead.alternatePhone || null,
      lead.email,
      lead.state || null,
      lead.city,
      lead.pincode || null,
      lead.proposedAddress || null,
      lead.spaceStatus || null,
      lead.carpetArea || null,
      lead.preferredPackage,
      lead.packageName || null,
      lead.investmentBudget || null,
      lead.financeRequired || "Self-Funded",
      lead.loanAssistance || "No",
      lead.currentProfession || null,
      lead.hasExperience || null,
      lead.message || null,
      lead.source || "apply_page",
      lead.status || "new",
      lead.adminNotes || null,
      new Date(lead.createdAt),
      new Date(lead.updatedAt),
    ];

    const result = await client.query(query, values);

    // Also sync to FranchiseLead table format
    try {
      await client.query(
        `INSERT INTO "FranchiseLead" (
          id, "leadId", "fullName", phone, email, city, state, pincode, address,
          "franchiseType", "investmentBudget", "currentFleetSize", "hasCommercialOffice",
          "businessExperience", "preferredLaunchTimeline", status, priority, "assignedTo",
          "inquiryMessage", "adminNotes", "createdAt", "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22
        )
        ON CONFLICT ("leadId") DO UPDATE SET
          "fullName" = EXCLUDED."fullName",
          phone = EXCLUDED.phone,
          email = EXCLUDED.email,
          city = EXCLUDED.city,
          status = EXCLUDED.status,
          "adminNotes" = EXCLUDED."adminNotes",
          "updatedAt" = EXCLUDED."updatedAt"`,
        [
          lead.id,
          lead.applicationId,
          lead.fullName,
          lead.mobile,
          lead.email || null,
          lead.city,
          lead.state || "West Bengal",
          lead.pincode || null,
          lead.proposedAddress || null,
          lead.packageName || `${lead.preferredPackage.toUpperCase()} Partner`,
          lead.investmentBudget || "Flexible",
          "None",
          lead.spaceStatus || (lead.carpetArea ? `${lead.carpetArea} space` : "Planned"),
          lead.hasExperience || lead.currentProfession || "",
          "Within 1 Month",
          lead.status || "NEW",
          "HIGH",
          "Franchise Desk",
          lead.message || "",
          lead.adminNotes || "",
          new Date(lead.createdAt),
          new Date(lead.updatedAt),
        ]
      );
    } catch (e: any) {
      console.warn("[saveFranchiseLeadToPostgres] FranchiseLead table sync warning:", e.message);
    }

    if (result.rows.length > 0) {
      console.log(
        `[POSTGRES] Successfully stored franchise/finance lead: ${lead.applicationId} - ${lead.fullName} (${lead.city})`
      );
      return lead;
    }
    return lead;
  } catch (err: any) {
    console.error("[POSTGRES ERROR] Failed to save franchise lead:", err.message);
    return null;
  }
}

export async function getFranchiseLeadsFromPostgres(params?: {
  status?: string;
  package?: string;
  query?: string;
  limit?: number;
  offset?: number;
}): Promise<{ total: number; leads: FranchiseLead[] } | null> {
  try {
    await initPostgresDb();
    const client = getPostgresPool();

    let sql = "SELECT * FROM franchise_leads WHERE 1=1";
    const values: any[] = [];
    let paramIndex = 1;

    if (params?.status && params.status !== "ALL") {
      sql += ` AND LOWER(status) = LOWER($${paramIndex++})`;
      values.push(params.status);
    }

    if (params?.package && params.package !== "ALL") {
      sql += ` AND LOWER(preferred_package) = LOWER($${paramIndex++})`;
      values.push(params.package);
    }

    if (params?.query) {
      sql += ` AND (
        LOWER(full_name) LIKE LOWER($${paramIndex})
        OR LOWER(city) LIKE LOWER($${paramIndex})
        OR mobile LIKE $${paramIndex}
        OR LOWER(application_id) LIKE LOWER($${paramIndex})
        OR LOWER(email) LIKE LOWER($${paramIndex})
      )`;
      values.push(`%${params.query}%`);
      paramIndex++;
    }

    sql += " ORDER BY created_at DESC";

    if (params?.limit) {
      sql += ` LIMIT $${paramIndex++}`;
      values.push(params.limit);
    }

    if (params?.offset) {
      sql += ` OFFSET $${paramIndex++}`;
      values.push(params.offset);
    }

    const result = await client.query(sql, values);

    const leads: FranchiseLead[] = result.rows.map((row) => ({
      id: row.id,
      applicationId: row.application_id,
      fullName: row.full_name,
      mobile: row.mobile,
      alternatePhone: row.alternate_phone || undefined,
      email: row.email,
      state: row.state || "",
      city: row.city,
      pincode: row.pincode || undefined,
      proposedAddress: row.proposed_address || undefined,
      spaceStatus: row.space_status || undefined,
      carpetArea: row.carpet_area || undefined,
      preferredPackage: row.preferred_package as PackageTier,
      packageName: row.package_name,
      investmentBudget: row.investment_budget || "",
      financeRequired: row.finance_required || "Self-Funded",
      loanAssistance: row.loan_assistance || "No",
      currentProfession: row.current_profession || undefined,
      hasExperience: row.has_experience || undefined,
      message: row.message || undefined,
      source: row.source || "apply_page",
      status: row.status as LeadStatus,
      adminNotes: row.admin_notes || undefined,
      createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
      updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
    }));

    return { total: leads.length, leads };
  } catch (err: any) {
    console.warn("[POSTGRES WARNING] Failed to query leads:", err.message);
    return null;
  }
}
