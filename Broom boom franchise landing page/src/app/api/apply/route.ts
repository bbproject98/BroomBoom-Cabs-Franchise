import { PackageTier } from "@/lib/db/schema";
import { handleOptions, jsonResponse } from "@/lib/cors";
import { db } from "@/lib/db";
import { saveFranchiseLeadToPostgres } from "@/lib/db/postgres";
import { sendLeadNotificationEmail, sendApplicantConfirmationEmail } from "@/lib/email";

export async function OPTIONS() {
  return handleOptions();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.fullName || !body.mobile || !body.city) {
      return jsonResponse(
        { success: false, error: "Full Name, Mobile Number, and City are required." },
        400
      );
    }

    const packageKey = (body.preferredPackage || body.selectedPackage || "gold").toLowerCase();
    const validPackage: PackageTier = ["silver", "gold", "platinum", "undecided"].includes(packageKey)
      ? (packageKey as PackageTier)
      : "gold";

    const packageName =
      body.packageName ||
      (validPackage === "silver"
        ? "Silver Partner (Booking Kiosk)"
        : validPackage === "gold"
        ? "Gold Partner (District Exclusive Hub)"
        : validPackage === "platinum"
        ? "Platinum Partner (Regional Master Franchise)"
        : "Custom Inquiry");

    // 1. Create lead in local JSON store (guaranteed immediate persistence)
    const lead = db.leads.create({
      fullName: body.fullName.trim(),
      mobile: body.mobile.trim(),
      alternatePhone: body.alternatePhone?.trim() || "",
      email: body.email?.trim() || "",
      state: body.state?.trim() || "West Bengal",
      city: body.city?.trim(),
      pincode: body.pincode?.trim() || "",
      proposedAddress: body.proposedAddress?.trim() || "",
      spaceStatus: body.spaceStatus || "",
      carpetArea: body.carpetArea || "",
      preferredPackage: validPackage,
      packageName,
      investmentBudget: body.investmentBudget || "Not specified",
      financeRequired: body.financeRequired || "Self-Funded / Ready Capital",
      loanAssistance: body.loanAssistance || "No (Self-Funded)",
      currentProfession: body.currentProfession || "",
      hasExperience: body.hasExperience || "",
      message: body.message || "",
      source: body.source || "apply_page",
      adminNotes: "Application submitted via online portal. Ready for territory manager call.",
    });

    // 2. 🚀 Save DIRECTLY to PostgreSQL (both franchise_leads and FranchiseLead tables)
    try {
      await saveFranchiseLeadToPostgres(lead);
    } catch (pgErr: any) {
      console.warn("[POSTGRES WARNING] Could not persist to PostgreSQL:", pgErr.message);
    }

    // 3. 📧 Send Email Notification to Admin & Confirmation to Applicant
    try {
      await sendLeadNotificationEmail(lead);
      if (lead.email) {
        await sendApplicantConfirmationEmail(lead);
      }
    } catch (mailErr: any) {
      console.warn("[EMAIL WARNING] Could not send email notification:", mailErr.message);
    }

    console.log(`[BACKEND] New Franchise Lead Created: ${lead.applicationId} - ${lead.fullName}`);

    return jsonResponse({
      success: true,
      message: "Your franchise application has been received successfully.",
      data: {
        applicationId: lead.applicationId,
        leadId: lead.id,
        applicant: lead.fullName,
        city: lead.city,
        packageName: lead.packageName,
        status: lead.status,
        submittedAt: lead.createdAt,
      },
    });
  } catch (error: any) {
    console.error("[BACKEND ERROR] Failed to save application:", error.message);
    return jsonResponse(
      { success: false, error: "Failed to process application. Please try again." },
      500
    );
  }
}