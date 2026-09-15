-- CreateTable
CREATE TABLE "franchise_leads" (
    "id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "alternate_phone" TEXT,
    "email" TEXT NOT NULL,
    "state" TEXT,
    "city" TEXT NOT NULL,
    "pincode" TEXT,
    "proposed_address" TEXT,
    "space_status" TEXT,
    "carpet_area" TEXT,
    "preferred_package" TEXT NOT NULL,
    "package_name" TEXT,
    "investment_budget" TEXT,
    "finance_required" TEXT DEFAULT 'Self-Funded',
    "loan_assistance" TEXT DEFAULT 'No',
    "current_profession" TEXT,
    "has_experience" TEXT,
    "message" TEXT,
    "source" TEXT DEFAULT 'apply_page',
    "status" TEXT NOT NULL DEFAULT 'new',
    "admin_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "franchise_leads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "franchise_leads_application_id_key" ON "franchise_leads"("application_id");

-- CreateIndex
CREATE INDEX "franchise_leads_status_idx" ON "franchise_leads"("status");

-- CreateIndex
CREATE INDEX "franchise_leads_city_idx" ON "franchise_leads"("city");

-- CreateIndex
CREATE INDEX "franchise_leads_preferred_package_idx" ON "franchise_leads"("preferred_package");

-- CreateIndex
CREATE INDEX "franchise_leads_created_at_idx" ON "franchise_leads"("created_at" DESC);
