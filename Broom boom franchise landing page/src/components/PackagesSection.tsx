"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Compass } from "lucide-react";

interface PackagesSectionProps {
  onSelectPackage?: (pkgId: string) => void;
}

export const PackagesSection: React.FC<PackagesSectionProps> = ({
  onSelectPackage,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const cards = [
    {
      id: "silver",
      tag: "DOMESTIC TRAVEL BOOM",
      image: "/images/travel-tajmahal.jpg",
      alt: "Taj Mahal - Indian Tourism & Travel Sector",
      headline: "21% Year-on-Year Growth of the Indian Tourism & Travel Sector",
    },
    {
      id: "gold",
      tag: "OUTBOUND VACATIONS",
      image: "/images/travel-roadtrip.jpg",
      alt: "Road trip travel - Domestic tourist growth",
      headline:
        "1.8 crore+ Indians holidayed abroad during 2022. 11.05% growth in domestic tourist visits",
    },
    {
      id: "platinum",
      tag: "HOLIDAY PACKAGES SURGE",
      image: "/images/travel-airport.jpg",
      alt: "Airport traveler - Holiday packages revenue",
      headline:
        "US$ 8.3 billion revenue projected for Holiday Packages business",
    },
  ];

  // Sync active dot with real-time horizontal scroll position
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, clientWidth } = scrollContainerRef.current;
    const firstChild = scrollContainerRef.current.children[0] as HTMLElement | undefined;
    const cardWidth = firstChild ? firstChild.offsetWidth + 16 : clientWidth * 0.74;
    const index = Math.round(scrollLeft / cardWidth);
    setActiveIndex(Math.min(Math.max(index, 0), cards.length - 1));
  };

  // Scroll to a specific card smoothly
  const scrollToCard = (index: number) => {
    if (!scrollContainerRef.current) return;
    const children = scrollContainerRef.current.children;
    if (children[index]) {
      (children[index] as HTMLElement).scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
      setActiveIndex(index);
    }
  };

  const scrollNext = () => {
    const next = Math.min(activeIndex + 1, cards.length - 1);
    scrollToCard(next);
  };

  const scrollPrev = () => {
    const prev = Math.max(activeIndex - 1, 0);
    scrollToCard(prev);
  };

  return (
    <section
      id="packages"
      className="py-5 sm:py-6 bg-puja-cream text-slate-900 relative"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Heading matching reference layout and warm cream palette */}
        <div className="text-center max-w-3xl mx-auto mb-3.5 sm:mb-4">
          <h2 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight leading-tight">
            Indians are travelling the world like never before!
          </h2>
        </div>

        {/* LAPTOP & DESKTOP VIEW: Clean 3-Column Grid */}
        <div className="hidden md:grid md:grid-cols-3 md:gap-6 max-w-5xl mx-auto items-stretch">
          {cards.map((card) => (
            <div
              key={card.id}
              onClick={() => onSelectPackage?.(card.id)}
              className="flex flex-col group h-full cursor-pointer"
            >
              <div className="bg-white rounded-xl border border-amber-200/80 shadow-[0_4px_25px_rgba(0,0,0,0.06)] hover:shadow-2xl hover:border-amber-400 p-4.5 sm:p-5 flex flex-col h-full transition-all duration-300 hover:-translate-y-1">
                {/* Photo with uniform card padding matching screenshot */}
                <div className="relative w-full h-48 sm:h-52 overflow-hidden rounded-lg mb-4 bg-slate-100 shrink-0">
                  <Image
                    src={card.image}
                    alt={card.alt}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    sizes="33vw"
                    priority
                  />
                </div>

                {/* Bold Headline Text */}
                <div className="flex-1 flex flex-col justify-start">
                  <h3 className="text-lg font-bold text-slate-950 leading-snug">
                    {card.headline}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* MOBILE VIEW: Horizontal Swipe Carousel */}
        <div className="md:hidden">
          {/* Mobile Swipe Cue & Counter */}
          <div className="flex items-center justify-between px-1 mb-3 text-xs">
            <span className="flex items-center gap-1.5 font-black text-amber-900">
              <Compass className="w-3.5 h-3.5 text-amber-600 animate-spin-slow" />
              <span>Market Trends</span>
            </span>
            <span className="bg-white border border-amber-200 text-slate-700 font-bold px-2.5 py-0.5 rounded-full shadow-xs text-[11px] flex items-center gap-1">
              <span>Card {activeIndex + 1} of {cards.length}</span>
              <span className="text-slate-400">•</span>
              <span className="text-amber-700">Swipe &rarr;</span>
            </span>
          </div>

          {/* Cards Carousel */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="grid grid-flow-col auto-cols-[70vw] sm:auto-cols-[280px] gap-3.5 overflow-x-auto snap-x snap-mandatory px-4 pb-4 -mx-4 items-stretch no-scrollbar"
          >
            {cards.map((card, idx) => (
              <div
                key={card.id}
                onClick={() => onSelectPackage?.(card.id)}
                className="flex flex-col group h-full shrink-0 snap-center cursor-pointer"
              >
                <div className={`bg-white rounded-xl border ${
                  activeIndex === idx ? "border-amber-400 ring-2 ring-amber-400/20" : "border-amber-200/70"
                } shadow-[0_4px_25px_rgba(0,0,0,0.06)] p-3.5 flex flex-col h-full transition-all duration-300`}>
                  <div className="relative w-full h-36 overflow-hidden rounded-lg mb-2.5 bg-slate-100 shrink-0">
                    <Image
                      src={card.image}
                      alt={card.alt}
                      fill
                      className="object-cover"
                      sizes="70vw"
                      priority
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-start min-h-[44px]">
                    <h3 className="text-xs font-bold text-slate-950 leading-snug">
                      {card.headline}
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Interactive Carousel Controls */}
          <div className="flex justify-center items-center gap-3 pt-3">
            <button
              onClick={scrollPrev}
              disabled={activeIndex === 0}
              className={`p-1.5 rounded-full border border-amber-200 bg-white shadow-sm transition-opacity ${
                activeIndex === 0 ? "opacity-30 cursor-not-allowed" : "opacity-90 active:scale-95"
              }`}
              aria-label="Previous card"
            >
              <ChevronLeft className="w-4 h-4 text-slate-800" />
            </button>

            <div className="flex items-center gap-1.5">
              {cards.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollToCard(idx)}
                  className={`transition-all duration-300 rounded-full ${
                    activeIndex === idx
                      ? "w-6 h-1.5 bg-slate-950"
                      : "w-2 h-1.5 bg-slate-300 hover:bg-slate-400"
                  }`}
                  aria-label={`Go to card ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={scrollNext}
              disabled={activeIndex === cards.length - 1}
              className={`p-1.5 rounded-full border border-amber-200 bg-white shadow-sm transition-opacity ${
                activeIndex === cards.length - 1 ? "opacity-30 cursor-not-allowed" : "opacity-90 active:scale-95"
              }`}
              aria-label="Next card"
            >
              <ChevronRight className="w-4 h-4 text-slate-800" />
            </button>
          </div>
        </div>

        {/* Footer Text matching reference image */}
        <div className="mt-4 sm:mt-5 text-center max-w-3xl mx-auto space-y-1.5">
          <p className="text-sm sm:text-base text-slate-700 font-medium">
            Be the force that helps Indians live their travel dreams with your
            own{" "}
            <span
              onClick={() => onSelectPackage?.("gold")}
              className="text-amber-900 underline hover:text-amber-700 font-black transition-colors cursor-pointer"
            >
              BroomBoom Franchise
            </span>
            .
          </p>

          <div className="pt-0.5">
            <button
              onClick={() => onSelectPackage?.("gold")}
              className="inline-flex items-center gap-2 bg-brand-yellow hover:bg-brand-yellow-hover text-black font-black text-sm px-8 py-2.5 rounded-xl shadow-md hover:shadow-yellow-glow transition-all transform active:scale-95 cursor-pointer"
            >
              <span>Explore Franchise Opportunities</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};