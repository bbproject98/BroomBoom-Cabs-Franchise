const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Connecting to PostgreSQL via Prisma Client...");

  const testLead = await prisma.franchiseLead.upsert({
    where: { applicationId: "BB-2026-9901" },
    update: {
      fullName: "Debabrata Sen (Prisma Verified)",
      financeRequired: "Require Bank Loan Assistance",
      loanAssistance: "Yes (Need Project Report & Bank Tie-up)",
      status: "new",
    },
    create: {
      id: "lead-prisma-test-1",
      applicationId: "BB-2026-9901",
      fullName: "Debabrata Sen (Prisma Verified)",
      mobile: "+91 98310 99001",
      email: "debabrata.sen@example.com",
      city: "Kolkata",
      state: "West Bengal",
      pincode: "700029",
      proposedAddress: "Gariahat Commercial Complex",
      spaceStatus: "Owned commercial space ready",
      carpetArea: "400 sq.ft",
      preferredPackage: "gold",
      packageName: "Gold Partner (District Exclusive Hub)",
      investmentBudget: "₹5.0 Lakhs - ₹10.0 Lakhs",
      financeRequired: "Require Bank Loan Assistance",
      loanAssistance: "Yes (Need Project Report & Bank Tie-up)",
      currentProfession: "Automobile Fleet Entrepreneur",
      hasExperience: "Yes, currently in travel / cab business",
      message: "Applying through Prisma backend connection.",
      source: "apply_page",
      status: "new",
      adminNotes: "Prisma Client test record.",
    },
  });

  console.log("SUCCESS! Saved lead via Prisma:", testLead.applicationId, "-", testLead.fullName);

  // Query via Prisma Client
  const count = await prisma.franchiseLead.count();
  console.log("Total leads in PostgreSQL (via Prisma count):", count);

  // Query finance view via Prisma $queryRaw
  const financeRows = await prisma.$queryRaw`
    SELECT application_id, full_name, city, preferred_package, investment_budget, finance_required, loan_assistance 
    FROM finance_leads 
    WHERE application_id = 'BB-2026-9901'
  `;
  console.log("Queried finance_leads PostgreSQL view (via Prisma $queryRaw):", financeRows);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Prisma test error:", err);
  process.exit(1);
});