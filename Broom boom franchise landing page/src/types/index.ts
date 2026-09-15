export interface FranchisePackage {
  id: "silver" | "gold" | "platinum";
  name: string;
  tagline: string;
  popular?: boolean;
  badge?: string;
  investmentRange: string;
  minInvestment: number;
  maxInvestment: number;
  franchiseFee: string;
  spaceRequired: string;
  idealFor: string;
  commissionSlab: string;
  roiPeriod: string;
  keyHighlights: string[];
  features: string[];
  revenueStreams: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  city: string;
  state: string;
  tier: string;
  monthsActive: number;
  monthlyRevenue: string;
  rating: number;
  quote: string;
  avatar: string;
}

export interface FaqItem {
  question: string;
  answer: string;
  category: "General" | "Investment" | "Operations" | "Earnings";
}

export interface FranchiseInquiry {
  fullName: string;
  email: string;
  mobile: string;
  state: string;
  city: string;
  preferredPackage: "silver" | "gold" | "platinum" | "undecided";
  investmentBudget: string;
  hasExperience: string;
  message?: string;
}

