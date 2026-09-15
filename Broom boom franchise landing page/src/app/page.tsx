"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { StatsBar } from "@/components/StatsBar";
import { PackagesSection } from "@/components/PackagesSection";
import { FranchiseOverview } from "@/components/FranchiseOverview";
import { WhyBroomBoom } from "@/components/WhyBroomBoom";
import { JourneySection } from "@/components/JourneySection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { FaqSection } from "@/components/FaqSection";
import { Footer } from "@/components/Footer";
import { BrochureModal } from "@/components/BrochureModal";
import { FloatingCta } from "@/components/FloatingCta";

export default function Home() {
  const router = useRouter();
  const [isBrochureModalOpen, setIsBrochureModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string>("gold");

  const handleNavigateToApply = (packageId: string = "gold") => {
    setSelectedPackage(packageId);
    router.push(`/apply?package=${packageId}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-puja-cream text-slate-900 selection:bg-brand-yellow selection:text-black font-sans">
      {/* Top Navbar */}
      <Navbar
        onOpenApplyModal={handleNavigateToApply}
        onOpenBrochureModal={() => setIsBrochureModalOpen(true)}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* Hero Section with Banner */}
        <HeroSection
          selectedPackage={selectedPackage ?? "gold"}
          onOpenApplyModal={handleNavigateToApply}
        />

        {/* The 3 Franchise Packages Section */}
        <PackagesSection onSelectPackage={handleNavigateToApply} />

        {/* What a BroomBoom Franchise Does & Services (Franchise Overview) */}
        <FranchiseOverview />

        {/* Scaled Network Stats Bar */}
        <StatsBar />

        {/* Why BroomBoom & Competitive Comparison */}
        <WhyBroomBoom onOpenApplyModal={handleNavigateToApply} />

        {/* Begin Your Journey Now (4-Step Onboarding Roadmap) */}
        <JourneySection onOpenApplyModal={handleNavigateToApply} />

        {/* Words from our Franchise Partners (Success Stories) */}
        <TestimonialsSection onOpenApplyModal={handleNavigateToApply} />

        {/* Comprehensive FAQ Accordion */}
        <FaqSection onContactClick={() => handleNavigateToApply("gold")} />
      </main>

      {/* Corporate & Legal Footer */}
      <Footer
        onOpenApplyModal={handleNavigateToApply}
        onOpenBrochureModal={() => setIsBrochureModalOpen(true)}
      />

      {/* Sticky Mobile Conversion Bar */}
      <FloatingCta onApplyClick={() => handleNavigateToApply(selectedPackage)} />

      {/* Official Brochure Prospectus Modal */}
      <BrochureModal
        isOpen={isBrochureModalOpen}
        onClose={() => setIsBrochureModalOpen(false)}
      />
    </div>
  );
}
