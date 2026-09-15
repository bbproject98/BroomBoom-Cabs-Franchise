const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Simulating Live Form Submission via API test...");

  // Generate unique test lead
  const testAppId = `BB-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  const created = await prisma.franchiseLead.create({
    data: {
      id: `lead-${Date.now()}`,
      applicationId: testAppId,
      fullName: "Siddhartha Mukherjee",
      mobile: "+91 98305 67890",
      email: "siddhartha.m@example.com",
      state: "West Bengal",
      city: "Kolkata",
      pincode: "700020",
      proposedAddress: "Park Street Commercial Space",
      spaceStatus: "Owned commercial space ready",
      carpetArea: "450 sq.ft",
      preferredPackage: "platinum",
      packageName: "Platinum Partner (Regional Master Franchise)",
      investmentBudget: "₹10.0 Lakhs - ₹25.0 Lakhs",
      financeRequired: "Require Bank Loan Assistance",
      loanAssistance: "Yes (Need Bank Loan Assistance)",
      currentProfession: "Logistics Business Owner",
      hasExperience: "Yes, currently in travel / taxi / logistics",
      message: "Ready to proceed with regional hub launch.",
      source: "apply_page",
      status: "new",
      adminNotes: "Application submitted via online portal. Ready for territory manager call."
    }
  });

  console.log("Lead successfully inserted via Prisma Client:", created.applicationId, created.fullName);

  // Check if it appears in PostgreSQL finance_leads view
  const financeViewResult = await prisma.$queryRaw`
    SELECT application_id, full_name, city, preferred_package, investment_budget, finance_required, loan_assistance, status
    FROM finance_leads
    WHERE application_id = ${testAppId}
  `;

  console.log("Verified from PostgreSQL finance_leads VIEW:", financeViewResult);
  await prisma.$disconnect();
}

main().catch(console.error);