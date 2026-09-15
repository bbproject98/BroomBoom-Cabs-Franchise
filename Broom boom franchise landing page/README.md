# 🚕 BroomBoom Franchise Landing Page (MakeMyTrip Style)

A high-converting, enterprise-grade franchise landing page built for **BroomBoom**, modeled closely after **MakeMyTrip's** franchise and partner portal aesthetics, typography, conversion architecture, and trust signals.

Built using **Next.js 14 (App Router)**, **TypeScript**, and **Tailwind CSS**.

---

## 🌟 Key Features & Sections

### 1. 💼 The 3 Franchise Packages
Detailed, practical tier structures designed for prospective franchise entrepreneurs:
- **Silver Partner (Booking Kiosk / Express Agent)**: ₹1.5L - ₹2.5L investment, 100-150 sq.ft space, 8%-12% booking commissions. Ideal for travel agents and transit counters.
- **Gold Partner (Exclusive District Hub)** *(Most Popular)*: ₹5.0L - ₹7.5L investment, 300-500 sq.ft commercial office, exclusive district territory, driver onboarding hub rights, 15%-20% commission + recurring territory overrides.
- **Platinum Partner (Regional Master Franchise)**: ₹15L - ₹20L investment, 800-1,200 sq.ft regional HQ, zone/state exclusivity, up to 40% sign-up royalty on sub-franchises, EV charging & fleet lease integration.

### 2. 🧮 Interactive ROI & Profitability Calculator
- Dynamic sliders for **Daily Bookings**, **Average Ticket Fare**, and **Active Fleet / Drivers Managed**.
- Real-time formulas computing **Gross Turnover**, **Commission Earnings**, **Driver Overrides**, **Estimated Net Monthly Profit**, **Annual Profit**, and **Payback Period** (in months).
- Direct **"Apply With This Forecast"** CTA.

### 3. 🎯 MakeMyTrip-Grade Hero Section & Lead Capture
- In-hero fast inquiry form capturing Name, Phone, Email, Target City/State, Preferred Package, and Investment Readiness.
- Real-time confetti celebration upon submission and clear confirmation dialog.

### 4. 📊 Network Scale & Trust Bar
- Live metric cards showing 120+ Cities, 50,000+ Drivers, 5.2M+ Completed Rides, 350+ Franchisees, and 38.5% Average ROI.

### 5. 🚀 Why BroomBoom & Competitive Matrix
- 6 core value pillars (Proprietary SaaS console, centralized marketing, 1-on-1 onboarding training, 24x7 relationship manager).
- Side-by-side comparison: *Traditional Taxi Agency vs. Official BroomBoom Franchise*.

### 6. 🏢 Infrastructure & Store Requirements Matrix
- Detailed comparison table outlining Carpet Area, Location Type, Frontage & Signage, Staffing, and IT requirements across all 3 tiers.

### 7. 🛣️ 4-Step Onboarding Roadmap
- From Online Application to Territory Feasibility, Agreement Signing, and HQ-Assisted Grand Launch.

### 8. ⭐️ Verified Partner Success Stories & FAQ Accordion
- Real franchisee testimonials with city tags, avatars, and verified monthly earnings.
- Interactive category-filtered FAQ accordion answering investment, licensing, and operational questions.

### 9. 📥 Lead-Gated PDF Brochure Modal & Mobile Sticky CTA
- "Download Official Franchise Kit" dialog that generates an instant prospectus download.
- Sticky mobile navigation bar with 1-click calling and instant application.

---

## 🛠️ Tech Stack
- **Framework**: Next.js 14.2 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (MakeMyTrip Red `#E41D25` & Deep Navy `#0B1A30` palette)
- **Icons**: Lucide React
- **Animations / Effects**: Canvas Confetti, Tailwind smooth scroll

---

## 🚀 Getting Started

### Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
npm run start
```

---

## 📂 Project Structure
```
├── src/
│   ├── app/
│   │   ├── globals.css          # Tailwind directives & custom utilities
│   │   ├── layout.tsx           # SEO metadata, OpenGraph, viewport
│   │   └── page.tsx             # Main landing page assembling all components
│   ├── components/
│   │   ├── Navbar.tsx           # Sticky MMT header & announcement bar
│   │   ├── HeroSection.tsx      # Banner + Lead Capture Form
│   │   ├── StatsBar.tsx         # Trust metrics bar
│   │   ├── PackagesSection.tsx  # The 3 Franchise packages cards & tabs
│   │   ├── RoiCalculator.tsx    # Interactive profit & turnover slider tool
│   │   ├── WhyBroomBoom.tsx     # Value props & traditional vs modern comparison
│   │   ├── RequirementsTable.tsx# Side-by-side infrastructure checklist
│   │   ├── JourneySection.tsx   # 4-step onboarding timeline
│   │   ├── TestimonialsSection.tsx # Verified franchisee success cards
│   │   ├── FaqSection.tsx       # Accordion FAQ with category filter
│   │   ├── BrochureModal.tsx    # Instant PDF prospectus download popup
│   │   ├── LeadFormModal.tsx    # Priority franchise application popup
│   │   ├── FloatingCta.tsx      # Sticky mobile action bar
│   │   └── Footer.tsx           # Corporate footer, contact, and legal disclaimer
│   ├── data/
│   │   └── franchiseData.ts     # Configurable packages, stats, FAQs & reviews
│   └── types/
│       └── index.ts             # TypeScript interfaces
├── tailwind.config.ts           # Custom brand colors & box shadows
└── package.json
```

