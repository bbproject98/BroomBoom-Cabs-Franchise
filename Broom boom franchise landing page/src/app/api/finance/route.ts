import { handleOptions, jsonResponse } from "@/lib/cors";
import { getPostgresPool, initPostgresDb } from "@/lib/db/postgres";
import { db } from "@/lib/db";

export async function OPTIONS() {
  return handleOptions();
}

/**
 * GET /api/finance
 * Returns all finance-specific leads directly from PostgreSQL view `finance_leads`
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const financeStatus = searchParams.get("financeStatus") || undefined;
    const loanAssistance = searchParams.get("loanAssistance") || undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 50;

    let leads: any[] = [];
    let source = "postgres_view";

    try {
      await initPostgresDb();
      const client = getPostgresPool();

      let query = `
        SELECT 
          id,
          application_id AS "applicationId",
          full_name AS "fullName",
          mobile,
          email,
          city,
          state,
          preferred_package AS "preferredPackage",
          package_name AS "packageName",
          investment_budget AS "investmentBudget",
          finance_required AS "financeRequired",
          loan_assistance AS "loanAssistance",
          space_status AS "spaceStatus",
          carpet_area AS "carpetArea",
          current_profession AS "currentProfession",
          status,
          created_at AS "createdAt",
          updated_at AS "updatedAt"
        FROM finance_leads
        WHERE 1=1
      `;
      const values: any[] = [];
      let idx = 1;

      if (loanAssistance && loanAssistance !== "ALL") {
        query += ` AND LOWER(loan_assistance) LIKE LOWER($${idx++})`;
        values.push(`%${loanAssistance}%`);
      }

      if (financeStatus && financeStatus !== "ALL") {
        query += ` AND LOWER(finance_required) LIKE LOWER($${idx++})`;
        values.push(`%${financeStatus}%`);
      }

      query += ` ORDER BY created_at DESC LIMIT $${idx}`;
      values.push(limit);

      const result = await client.query(query, values);
      leads = result.rows;
    } catch (pgErr: any) {
      console.warn("[FINANCE API WARNING] PostgreSQL query fallback:", pgErr.message);
      source = "json_store_fallback";
      const storeLeads = db.leads.getAll();
      leads = storeLeads.leads.map((l) => ({
        id: l.id,
        applicationId: l.applicationId,
        fullName: l.fullName,
        mobile: l.mobile,
        email: l.email,
        city: l.city,
        state: l.state,
        preferredPackage: l.preferredPackage,
        packageName: l.packageName,
        investmentBudget: l.investmentBudget,
        financeRequired: l.financeRequired || "Self-Funded",
        loanAssistance: l.loanAssistance || "No",
        spaceStatus: l.spaceStatus,
        carpetArea: l.carpetArea,
        currentProfession: l.currentProfession,
        status: l.status,
        createdAt: l.createdAt,
        updatedAt: l.updatedAt,
      }));
    }

    return jsonResponse({
      success: true,
      source,
      count: leads.length,
      leads,
    });
  } catch (error: any) {
    console.error("[FINANCE API ERROR]:", error);
    return jsonResponse(
      { success: false, error: "Failed to retrieve finance leads." },
      500
    );
  }
}