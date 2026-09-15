export type LeadStatus =
  | "new"
  | "contacted"
  | "under_review"
  | "site_visit"
  | "approved"
  | "rejected";

export type PackageTier = "silver" | "gold" | "platinum" | "undecided";

export interface FranchiseLead {
  id: string;
  applicationId: string; // e.g. BB-2026-1042
  fullName: string;
  mobile: string;
  alternatePhone?: string;
  email: string;
  state: string;
  city: string;
  pincode?: string;
  proposedAddress?: string;
  spaceStatus?: string;
  carpetArea?: string;
  preferredPackage: PackageTier;
  packageName?: string;
  investmentBudget: string;
  financeRequired?: string;
  loanAssistance?: string;
  currentProfession?: string;
  hasExperience?: string;
  message?: string;
  source: "modal" | "apply_page" | "direct" | "api";
  status: LeadStatus;
  adminNotes?: string;
  ipAddress?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BrochureDownload {
  id: string;
  name: string;
  mobile: string;
  city: string;
  downloadedAt: string;
}

export interface FranchiseHub {
  id: string;
  city: string;
  state: string;
  type: string;
  tier: "Silver" | "Gold" | "Platinum";
  address: string;
  phone: string;
  openHours: string;
  isActive: boolean;
  createdAt: string;
}

export interface AnalyticsStats {
  totalLeads: number;
  newLeadsToday: number;
  contactedLeads: number;
  approvedLeads: number;
  totalBrochureDownloads: number;
  activeHubsCount: number;
  packageBreakdown: {
    silver: number;
    gold: number;
    platinum: number;
    undecided: number;
  };
  cityBreakdown: Record<string, number>;
  recentActivity: Array<{
    type: "lead" | "brochure" | "hub";
    description: string;
    timestamp: string;
  }>;
}

export interface AdminSession {
  username: string;
  role: "superadmin" | "manager";
  expiresAt: number;
}

