"use client";

import React from "react";
import Image from "next/image";

interface HeroSectionProps {
  selectedPackage?: string;
  onApplySuccess?: (data?: any) => void;
  onOpenApplyModal?: (packageId?: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  selectedPackage = "gold",
  onOpenApplyModal,
}) => {
  return (
    <section className="relative w-full">
      <div
        onClick={() => onOpenApplyModal?.(selectedPackage)}
        className="block relative cursor-pointer"
        title="Click to Apply for BroomBoom Franchise"
      >
        {/* Laptop & Desktop View */}
        <div className="hidden md:block relative w-full">
          <Image
            src="/hero-banner-v2.png"
            alt="Let's Make Travel Dreams Come True Together! Become a Proud Broom Boom Cabs Franchise Owner Today"
            width={1920}
            height={600}
            className="w-full h-auto object-cover"
            priority
          />
        </div>

        {/* Mobile View: Dedicated clean mobile banner matching reference screenshot */}
        <div className="md:hidden relative w-full overflow-hidden bg-[#7dc3db]">
          <Image
            src="/hero-banner-mobile-v2.png"
            alt="Let's Make Travel Dreams Come True Together! Become a Proud Broom Boom Cabs Franchise Owner Today"
            width={920}
            height={616}
            className="w-full h-auto object-cover"
            priority
          />
        </div>
      </div>
    </section>
  );
};