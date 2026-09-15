import { db } from "@/lib/db";
import { PackageTier } from "@/lib/db/schema";
import { handleOptions, jsonResponse } from "@/lib/cors";
import { saveFranchiseLeadToPostgres } from "@/lib/db/postgres";

export async function OPTIONS() {
  return handleOptions();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.fullName || !body.mobile || !body.city) {
      return jsonResponse(
        {
          success: false,
          error: "Full Name, Mobile Number, and City are required.",
        },
        400
      );
    }

    const packageKey = (body.preferredPackage || body.selectedPackage || "gold").toLowerCase();
    const validPackage: PackageTier = ["silver", "gold", "platinum", "undecided"].includes(packageKey)
      ? (packageKey as PackageTier)
      : "gold";

    const newLead = db.leads.create({
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
      packageName:
        body.packageName ||
        (validPackage === "silver"
          ? "Silver Partner (Booking Kiosk)"
          : validPackage === "gold"
          ? "Gold Partner (District Exclusive Hub)"
          : validPackage === "platinum"
          ? "Platinum Partner (Regional Master Franchise)"
          : "Custom Inquiry"),
      investmentBudget: body.investmentBudget || "Not specified",
      financeRequired: body.financeRequired || "Self-Funded / Ready Capital",
      loanAssistance: body.loanAssistance || "No (Self-Funded)",
      currentProfession: body.currentProfession || "",
      hasExperience: body.hasExperience || "",
      message: body.message || "",
      source: body.source || "apply_page",
      adminNotes: "Application submitted via online portal. Ready for territory manager call.",
    });

    // Store in PostgreSQL database
    try {
      await saveFranchiseLeadToPostgres(newLead);
      console.log(`[BACKEND - POSTGRES] Stored lead ${newLead.applicationId} in PostgreSQL.`);
    } catch (pgErr: any) {
      console.warn(`[BACKEND - POSTGRES WARNING] Could not persist to PostgreSQL:`, pgErr.message);
    }

    console.log(`[BACKEND] New Franchise Lead Created: ${newLead.applicationId} - ${newLead.fullName} (${newLead.city})`);

    return jsonResponse({
      success: true,
      message: "Your franchise application has been received successfully.",
      data: {
        applicationId: newLead.applicationId,
        leadId: newLead.id,
        applicant: newLead.fullName,
        city: newLead.city,
        packageName: newLead.packageName,
        status: newLead.status,
        submittedAt: newLead.createdAt,
      },
    });
  } catch (error) {
    console.error("[BACKEND ERROR] Failed to process franchise application:", error);
    return jsonResponse(
      { success: false, error: "Internal server error processing application." },
      500
    );
  }
}
