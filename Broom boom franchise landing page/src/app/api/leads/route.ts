import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { PackageTier } from "@/lib/db/schema";
import { corsHeaders, handleOptions, jsonResponse } from "@/lib/cors";
import { saveFranchiseLeadToPostgres } from "@/lib/db/postgres";
import { sendLeadNotificationEmail } from "@/lib/email";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const pkg = searchParams.get("package") || undefined;
    const query = searchParams.get("query") || undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : undefined;
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!, 10) : undefined;

    const data = db.leads.getAll({ status, package: pkg, query, limit, offset });

    return jsonResponse({
      success: true,
      total: data.total,
      leads: data.leads,
    });
  } catch (error) {
    console.error("[BACKEND ERROR] Failed to fetch leads:", error);
    return jsonResponse(
      { success: false, error: "Failed to fetch franchise leads" },
      500
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.fullName || !body.mobile || !body.city) {
      return jsonResponse(
        { success: false, error: "Full Name, Mobile, and City are required fields." },
        400
      );
    }

    const packageKey = (body.preferredPackage || "gold").toLowerCase();
    const validPackage: PackageTier = ["silver", "gold", "platinum", "undecided"].includes(packageKey)
      ? (packageKey as PackageTier)
      : "gold";

    const lead = db.leads.create({
      fullName: body.fullName.trim(),
      mobile: body.mobile.trim(),
      alternatePhone: body.alternatePhone?.trim() || "",
      email: body.email?.trim() || "",
      state: body.state?.trim() || "",
      city: body.city?.trim(),
      pincode: body.pincode?.trim() || "",
      proposedAddress: body.proposedAddress?.trim() || "",
      spaceStatus: body.spaceStatus || "",
      carpetArea: body.carpetArea || "",
      preferredPackage: validPackage,
      packageName: body.packageName || `${validPackage.toUpperCase()} Partner`,
      investmentBudget: body.investmentBudget || "Flexible",
      financeRequired: body.financeRequired || "Self-Funded / Ready Capital",
      loanAssistance: body.loanAssistance || "No (Self-Funded)",
      currentProfession: body.currentProfession || "",
      hasExperience: body.hasExperience || "",
      message: body.message || "",
      source: body.source || "api",
      adminNotes: body.adminNotes || "Created via API.",
    });

    try {
      await saveFranchiseLeadToPostgres(lead);
    } catch (pgErr) {
      console.warn("[POSTGRES WARNING] Could not persist to PostgreSQL:", pgErr);
    }

    // Send email notification to admin
    try {
      await sendLeadNotificationEmail(lead);
    } catch (mailErr: any) {
      console.warn("[EMAIL WARNING] Could not send lead notification email:", mailErr.message);
    }

    return jsonResponse({
      success: true,
      message: "Lead created successfully",
      lead,
    });
  } catch (error) {
    console.error("[BACKEND ERROR] Failed to create lead:", error);
    return jsonResponse(
      { success: false, error: "Failed to create franchise lead" },
      500
    );
  }
}
