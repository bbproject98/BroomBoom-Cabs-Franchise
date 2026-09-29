"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Lock,
  ArrowRight,
  Zap,
  ShieldCheck,
  Loader2,
  AlertCircle,
  Phone,
  ArrowLeft,
  Star,
  HelpCircle,
  ChevronDown,
  MessageCircle,
  Award,
} from "lucide-react";
import { getPackagePricing } from "@/lib/cashfree";

declare global {
  interface Window {
    Cashfree: any;
  }
}

/* ---------------------------------------------------------------------
 * Real Partner Reviews for Checkout Page
 * -------------------------------------------------------------------*/
const CHECKOUT_REVIEWS = [
  {
    name: "Rajesh Sharma",
    city: "Jaipur, Rajasthan",
    package: "Gold Partner",
    rating: 5,
    earnings: "₹2.8L/mo",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    review:
      "Partnering with BroomBoom transformed my business. The driver onboarding hub alone generates substantial recurring revenue. Managing bookings and fleet is completely seamless.",
  },
  {
    name: "Pooja Deshmukh",
    city: "Pune, Maharashtra",
    package: "Silver Kiosk Partner",
    rating: 5,
    earnings: "₹95K/mo",
    avatar:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    review:
      "I started with a small kiosk counter near Pune railway station. Within 3 months I broke even! The BroomBoom brand attracts regular airport & outstation cab commuters daily.",
  },
  {
    name: "Vikram Singhania",
    city: "Lucknow & Kanpur, UP",
    package: "Platinum Master Franchise",
    rating: 5,
    earnings: "₹7.4L/mo",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    review:
      "The master franchise model is exceptional. We have sub-franchisees operating across the zone, and automated weekly settlements ensure complete peace of mind. Exceptional HQ support.",
  },
  {
    name: "Amit Banerjee",
    city: "Kolkata, West Bengal",
    package: "Gold Partner",
    rating: 5,
    earnings: "₹3.2L/mo",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    review:
      "Securing North Kolkata territory was our best decision. The territory booking overrides and airport transfer markups give predictable daily cash flow from day one.",
  },
];

/* ---------------------------------------------------------------------
 * Checkout & Payment FAQs
 * -------------------------------------------------------------------*/
const CHECKOUT_FAQS = [
  {
    q: "What happens immediately after completing my payment?",
    a: "Your selected territory is instantly locked in our national registry to prevent duplicate allocations. You will receive an official confirmation receipt with your Order ID via email and SMS. Within 2 hours, your assigned Territory Relationship Manager (TRM) will call you to initiate documentation, software credentials, and dispatch your physical branding kit.",
  },
  {
    q: "Is this payment through Cashfree PG safe and secure?",
    a: "100% secure. Transactions are processed via Cashfree Payments using 256-bit bank-grade SSL encryption and RBI-compliant PCI-DSS Level 1 infrastructure. You can pay via UPI (Google Pay, PhonePe, Paytm), Net Banking across 50+ Indian banks, Debit/Credit Cards, or corporate accounts.",
  },
  {
    q: "Will I receive a GST tax invoice for this transaction?",
    a: "Yes. An official GST tax invoice containing BroomBoom Mobility Technologies Ltd.'s corporate GSTIN and your business details will be automatically issued and emailed to your registered email address.",
  },
  {
    q: "Can I upgrade my franchise tier later (e.g. Silver to Gold or Platinum)?",
    a: "Yes! You can upgrade your package at any time by paying the differential fee, subject to geographical territory exclusivity availability in your preferred district or zone.",
  },
  {
    q: "What if I face an issue during payment or need assistance?",
    a: "Our Senior Onboarding Team is available on our toll-free helpline 6289952418 (1800-270-6600) and via WhatsApp at +91 6289952418. We can guide you in real time.",
  },
];

/* ---------------------------------------------------------------------
 * Per-package theme — Silver = Slate, Gold = Amber, Platinum = Cyan
 * -------------------------------------------------------------------*/
const PACKAGE_THEMES: Record<string, any> = {
  silver: {
    pageBg: "#F1F5F9",
    gridLine: "rgba(100, 116, 139, 0.20)",
    cardBg: "linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)",
    cardBorderClass: "border-slate-300",
    cardShadow: "0 20px 50px -10px rgba(100,116,139,0.30), 0 0 30px rgba(203,213,225,0.40)",
    headerBorderClass: "border-slate-300",
    logoBorderClass: "border-slate-500",
    brandAccent: "text-slate-700",
    badgePillBg: "bg-slate-100",
    badgePillText: "text-slate-900",
    badgePillBorder: "border-slate-300",
    congratsBadgeBorder: "border-slate-300",
    congratsBadgeBg: "bg-white/95",
    congratsBadgeText: "text-slate-900",
    headlineAccent: "text-slate-700",
    featureCardBorder: "border-slate-200",
    featureCardBg: "bg-white/95",
    benefitsBoxBorder: "border-slate-200",
    benefitsIconColor: "text-slate-600",
    benefitsCheckColor: "text-slate-500",
    darkPillBg: "bg-slate-800",
    darkPillText: "text-slate-100",
    saveBadgeClass: "bg-white text-slate-800 border-slate-300",
    taglineColor: "#475569",
    buttonClass:
      "bg-slate-900 hover:bg-black text-white shadow-md hover:shadow-lg shadow-slate-900/25",
    sandboxBgClass: "bg-slate-200/60 hover:bg-slate-200/80",
    sandboxBorderClass: "border-slate-400/60",
    trustBadgeBorder: "border-slate-300",
    trustBadgeBg: "bg-white/80",
  },
  gold: {
    pageBg: "#FFFDF2",
    gridLine: "rgba(225, 185, 110, 0.18)",
    cardBg: "#FFDF59",
    cardBorderClass: "border-amber-300",
    cardShadow: "0 25px 60px -10px rgba(245,158,11,0.40), 0 0 40px rgba(255,223,89,0.50)",
    headerBorderClass: "border-amber-200/80",
    logoBorderClass: "border-amber-400",
    brandAccent: "text-amber-600",
    badgePillBg: "bg-amber-100",
    badgePillText: "text-amber-900",
    badgePillBorder: "border-amber-200",
    congratsBadgeBorder: "border-amber-300/80",
    congratsBadgeBg: "bg-white/95",
    congratsBadgeText: "text-amber-950",
    headlineAccent: "text-[#D97706]",
    featureCardBorder: "border-amber-200/50",
    featureCardBg: "bg-white/95",
    benefitsBoxBorder: "border-amber-200/50",
    benefitsIconColor: "text-amber-600",
    benefitsCheckColor: "text-amber-500",
    darkPillBg: "bg-slate-950",
    darkPillText: "text-[#FFDF59]",
    saveBadgeClass: "bg-white text-emerald-800 border-emerald-300",
    taglineColor: "#7C4A03",
    buttonClass:
      "bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 shadow-md hover:shadow-lg shadow-amber-500/30",
    sandboxBgClass: "bg-amber-200/60 hover:bg-amber-200/80",
    sandboxBorderClass: "border-amber-400/60",
    trustBadgeBorder: "border-amber-300/80",
    trustBadgeBg: "bg-white/80",
  },
  platinum: {
    pageBg: "#ECFEFF",
    gridLine: "rgba(6, 182, 212, 0.20)",
    cardBg: "linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)",
    cardBorderClass: "border-cyan-300",
    cardShadow: "0 25px 60px -10px rgba(6,182,212,0.35), 0 0 35px rgba(186,230,253,0.50)",
    headerBorderClass: "border-cyan-200",
    logoBorderClass: "border-cyan-400",
    brandAccent: "text-cyan-600",
    badgePillBg: "bg-cyan-100",
    badgePillText: "text-cyan-900",
    badgePillBorder: "border-cyan-200",
    congratsBadgeBorder: "border-cyan-300/80",
    congratsBadgeBg: "bg-white/95",
    congratsBadgeText: "text-cyan-950",
    headlineAccent: "text-cyan-700",
    featureCardBorder: "border-cyan-200/60",
    featureCardBg: "bg-white/95",
    benefitsBoxBorder: "border-cyan-200/60",
    benefitsIconColor: "text-cyan-600",
    benefitsCheckColor: "text-cyan-500",
    darkPillBg: "bg-slate-900",
    darkPillText: "text-cyan-300",
    saveBadgeClass: "bg-white text-cyan-800 border-cyan-300",
    taglineColor: "#155E75",
    buttonClass:
      "bg-cyan-700 hover:bg-cyan-800 text-white shadow-md hover:shadow-lg shadow-cyan-600/30",
    sandboxBgClass: "bg-cyan-200/60 hover:bg-cyan-200/80",
    sandboxBorderClass: "border-cyan-400/60",
    trustBadgeBorder: "border-cyan-300/80",
    trustBadgeBg: "bg-white/80",
  },
};

function CheckoutContent() {
  const searchParams = useSearchParams();

  const leadId = searchParams.get("leadId") || "";
  const appId =
    searchParams.get("appId") ||
    `BB-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const pkgParam =
    searchParams.get("pkg") || searchParams.get("package") || "gold";
  const nameParam = searchParams.get("name") || "";
  const cityParam = searchParams.get("city") || "";
  const mobileParam = searchParams.get("mobile") || "";
  const emailParam = searchParams.get("email") || "";

  const [selectedPackage, setSelectedPackage] = useState<string>(
    ["silver", "gold", "platinum"].includes(pkgParam.toLowerCase())
      ? pkgParam.toLowerCase()
      : "gold"
  );

  const [applicant, setApplicant] = useState({
    fullName: nameParam,
    mobile: mobileParam,
    email: emailParam,
    city: cityParam,
    state: "West Bengal",
  });

  const [isPaying, setIsPaying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSandboxTest, setIsSandboxTest] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // If leadId is present, fetch applicant details
  useEffect(() => {
    if (leadId) {
      fetch(`/api/leads/${leadId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.lead) {
            const l = data.lead;
            setApplicant({
              fullName: l.fullName || "",
              mobile: l.mobile || "",
              email: l.email || "",
              city: l.city || "",
              state: l.state || "West Bengal",
            });
            if (l.preferredPackage) {
              setSelectedPackage(l.preferredPackage.toLowerCase());
            }
          }
        })
        .catch((e) => console.warn("Could not load lead by ID:", e));
    }
  }, [leadId]);

  const pricing = getPackagePricing(selectedPackage);
  const payableAmount = isSandboxTest ? 1.0 : pricing.amount;

  // Theme for currently selected package
  const theme = PACKAGE_THEMES[selectedPackage] || PACKAGE_THEMES.gold;

  const handlePayNow = async () => {
    setErrorMsg(null);
    setIsPaying(true);

    try {
      // 1. Create order on backend with FULL package fee
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId,
          applicationId: appId,
          packageTier: selectedPackage,
          fullName: applicant.fullName,
          mobile: applicant.mobile,
          email: applicant.email,
          city: applicant.city,
          isSandboxTest,
          customAmount: payableAmount,
        }),
      });

      const data = await res.json();

      if (!data.success || !data.data?.paymentSessionId) {
        throw new Error(
          data.error || "Failed to initialize Cashfree payment session."
        );
      }

      const { paymentSessionId } = data.data;

      // 2. Initialize Cashfree Web SDK
      if (!window.Cashfree) {
        throw new Error(
          "Cashfree Checkout SDK is still loading. Please retry in a few moments."
        );
      }

      const isProduction = process.env.NEXT_PUBLIC_CASHFREE_ENV === "production";
      const cashfree = window.Cashfree({
        mode: isProduction ? "production" : "sandbox",
      });

      // 3. Launch Checkout (Directly redirects to Cashfree PG)
      cashfree.checkout({
        paymentSessionId,
        redirectTarget: "_self",
      });
    } catch (err: any) {
      console.error("Payment error:", err);
      setErrorMsg(
        err.message ||
          "Failed to connect to Cashfree payment gateway. Please try again."
      );
      setIsPaying(false);
    }
  };

  return (
    <div
      className="min-h-screen text-slate-900 selection:bg-amber-200 selection:text-black font-sans pb-16 transition-colors duration-500"
      style={{
        backgroundColor: theme.pageBg,
        backgroundImage: `linear-gradient(to right, ${theme.gridLine} 1px, transparent 1px), linear-gradient(to bottom, ${theme.gridLine} 1px, transparent 1px)`,
        backgroundSize: "28px 28px",
      }}
    >
      {/* Load Cashfree SDK */}
      <Script
        src="https://sdk.cashfree.com/js/v3/cashfree.js"
        strategy="afterInteractive"
        onLoad={() => setSdkReady(true)}
      />

      {/* Top Navbar */}
      <header
        className={`sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b py-3.5 px-4 sm:px-8 shadow-sm transition-colors duration-500 ${theme.headerBorderClass}`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div
              className={`relative w-10 h-10 rounded-full overflow-hidden border-2 shadow-sm transition-colors duration-500 bg-white ${theme.logoBorderClass}`}
            >
              <Image
                src="/broomboom-logo.png"
                alt="BroomBoom Logo"
                fill
                className="object-contain p-0.5"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-slate-950">
                  Broom<span className={theme.brandAccent}>Boom</span>
                </span>
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider border transition-colors duration-500 ${theme.badgePillBg} ${theme.badgePillText} ${theme.badgePillBorder}`}
                >
                  Franchise
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">
                Official Partner Checkout
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <a
              href="tel:18002706600"
              className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors"
            >
              <Phone className={`w-3.5 h-3.5 ${theme.brandAccent}`} />
              <span>6289952418</span>
            </a>
            <Link
              href="/"
              className={`flex items-center gap-1.5 text-xs font-bold text-slate-700 border px-3.5 py-1.5 rounded-xl transition-all bg-white shadow-sm hover:bg-slate-50 ${theme.badgePillBorder}`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Overview</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-12">
        {errorMsg && (
          <div className="max-w-4xl mx-auto mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-2xl flex items-start gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-red-900">Payment Notice</h4>
              <p className="text-xs text-red-700 mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Balanced grid layout: left col 5, right col 7 with items-stretch for top and bottom level alignment */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-stretch">
          {/* LEFT COLUMN: Congratulations & Features — flex-col justify-between aligns with payment card top & bottom */}
          <div className="lg:col-span-5 min-w-0 flex flex-col justify-between lg:pt-6">
            {/* Top Content Group */}
            <div>
              {/* Same Package Selected Earlier Badge — aligned with right card badges */}
              <div className="mb-4">
                <div
                  className={`inline-flex items-center gap-1.5 border text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-xs transition-colors duration-500 ${theme.congratsBadgeBg} ${theme.congratsBadgeBorder} ${theme.congratsBadgeText}`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>SAME PACKAGE SELECTED EARLIER</span>
                </div>
              </div>

              {/* Congratulations Headline — aligned with Silver/Gold/Platinum Partner on right */}
              <h1 className="text-3xl sm:text-4xl lg:text-[38px] font-black text-slate-950 tracking-tight flex items-center gap-2.5 leading-tight">
                <span>Congratulations!</span>
                <span className="text-3xl sm:text-4xl">🎉</span>
              </h1>

              {/* Subheading with clean gap between label and subscription name */}
              <div className="mt-5 sm:mt-6">
                <p className="text-sm sm:text-base font-bold text-slate-700">
                  You have successfully selected the
                </p>
                <h2
                  className={`text-2xl sm:text-3xl font-black tracking-tight mt-2.5 sm:mt-3 transition-colors duration-500 ${theme.headlineAccent}`}
                >
                  {pricing.name} Subscription
                </h2>
              </div>

              {/* Explanatory text with generous gap */}
              <p className="mt-5 sm:mt-6 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md">
                Complete the payment to secure your territory and unlock all
                exclusive partner benefits. Your journey to market leadership
                starts here.
              </p>
            </div>

            {/* 3 Vertically Stacked Feature Cards — spaced and aligned to bottom of payment card */}
            <div className="mt-6 sm:mt-8 lg:mt-auto pt-2 space-y-3 sm:space-y-3.5 max-w-md">
              <div
                className={`rounded-2xl p-3.5 sm:p-4 shadow-xs border flex items-center gap-3.5 transition-all hover:-translate-y-0.5 ${theme.featureCardBg} ${theme.featureCardBorder}`}
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                </div>
                <span className="font-extrabold text-slate-900 text-sm">
                  Instant Territory Locking
                </span>
              </div>

              <div
                className={`rounded-2xl p-3.5 sm:p-4 shadow-xs border flex items-center gap-3.5 transition-all hover:-translate-y-0.5 ${theme.featureCardBg} ${theme.featureCardBorder}`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${theme.badgePillBg} ${theme.badgePillBorder}`}
                >
                  <Zap className={`w-5 h-5 ${theme.brandAccent}`} />
                </div>
                <span className="font-extrabold text-slate-900 text-sm">
                  Fast-Track Onboarding
                </span>
              </div>

              <div
                className={`rounded-2xl p-3.5 sm:p-4 shadow-xs border flex items-center gap-3.5 transition-all hover:-translate-y-0.5 ${theme.featureCardBg} ${theme.featureCardBorder}`}
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 flex-shrink-0">
                  <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                </div>
                <span className="font-extrabold text-slate-900 text-sm">
                  Secure Payment Gateway
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: The Compact Glowing Plan Card */}
          <div className="lg:col-span-7 min-w-0 w-full flex justify-center lg:justify-end">
            <div
              className={`w-full max-w-[560px] rounded-[26px] p-5 sm:p-6 border relative transition-all duration-500 ${theme.cardBorderClass}`}
              style={{
                background: theme.cardBg,
                boxShadow: theme.cardShadow,
              }}
            >
              {/* Badges Top Row */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 mb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-[#FF2E56] text-white text-[11px] font-black px-3 py-1 rounded-md uppercase tracking-wider shadow-xs">
                    {pricing.discount}
                  </span>
                  <span className="bg-white text-slate-950 text-[11px] font-black px-3 py-1 rounded-md uppercase tracking-wider shadow-xs">
                    EXCLUSIVE DEAL
                  </span>
                </div>
                <span
                  className={`text-[11px] font-black px-3.5 py-1 rounded-full uppercase tracking-wider shadow-xs flex items-center gap-1 transition-colors duration-500 ${theme.darkPillBg} ${theme.darkPillText}`}
                >
                  {pricing.badge}
                </span>
              </div>

              {/* Title & Price Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="text-2xl sm:text-[26px] font-black text-slate-950 tracking-tight leading-tight">
                    {pricing.name}
                  </h3>
                  <p
                    className="text-xs sm:text-[13px] font-extrabold mt-0.5"
                    style={{ color: theme.taglineColor }}
                  >
                    {pricing.tagline}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-rose-600 font-extrabold line-through text-xs sm:text-sm block">
                    {pricing.formattedOriginalPrice}
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-slate-950 block -mt-0.5 tracking-tight leading-none">
                    {pricing.formattedAmount}
                  </span>
                  <span
                    className={`inline-block text-[10px] font-black px-2 py-0.5 rounded border shadow-xs mt-1 transition-colors duration-500 ${theme.saveBadgeClass}`}
                  >
                    You Save {pricing.formattedSavings}
                  </span>
                </div>
              </div>

              {/* White Package Benefits Box */}
              <div
                className={`mt-4 bg-white/95 rounded-2xl p-4 sm:p-4.5 shadow-xs border transition-colors duration-500 ${theme.benefitsBoxBorder}`}
              >
                <div className="text-xs font-black uppercase tracking-wider text-slate-950 flex items-center gap-1.5 mb-3">
                  <CheckCircle2
                    className={`w-4 h-4 transition-colors duration-500 ${theme.benefitsIconColor}`}
                  />
                  <span>PACKAGE BENEFITS:</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-5 gap-y-2.5 text-xs text-slate-800">
                  <div className="space-y-2.5">
                    {pricing.benefitsCol1.map((b: string, i: number) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 leading-snug"
                      >
                        <CheckCircle2
                          className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 transition-colors duration-500 ${theme.benefitsCheckColor}`}
                        />
                        <span className="font-semibold text-slate-700 text-[11px] sm:text-xs">
                          {b}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2.5">
                    {pricing.benefitsCol2.map((b: string, i: number) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 leading-snug"
                      >
                        <CheckCircle2
                          className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 transition-colors duration-500 ${theme.benefitsCheckColor}`}
                        />
                        <span className="font-semibold text-slate-700 text-[11px] sm:text-xs">
                          {b}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Optional Sandbox Mode Switch for Testing */}
              {process.env.NEXT_PUBLIC_CASHFREE_ENV !== "production" && (
                <div className="mt-3">
                  <label
                    className={`flex items-center gap-2.5 py-2 px-3 rounded-xl border cursor-pointer transition-colors ${theme.sandboxBgClass} ${theme.sandboxBorderClass}`}
                  >
                    <input
                      type="checkbox"
                      checked={isSandboxTest}
                      onChange={(e) => setIsSandboxTest(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-slate-300 focus:ring-slate-500"
                    />
                    <div className="text-[11px] leading-tight flex items-center gap-1.5">
                      <span className="font-bold text-slate-950">
                        🧪 Sandbox Test Mode (Pay ₹1.00)
                      </span>
                      <span className="text-slate-600 text-[10px]">
                        — Simulator cards / UPI
                      </span>
                    </div>
                  </label>
                </div>
              )}

              {/* Pay Now Button — themed */}
              <div className="mt-4 sm:mt-5">
                <button
                  type="button"
                  onClick={handlePayNow}
                  disabled={isPaying}
                  className={`w-full font-black py-3.5 sm:py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 text-base sm:text-lg cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed ${theme.buttonClass}`}
                >
                  {isPaying ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Connecting to Cashfree...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>
                        Pay Now (
                        {isSandboxTest ? "₹1" : pricing.formattedAmount})
                      </span>
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-1" />
                    </>
                  )}
                </button>
              </div>

              {/* Bottom 3 Trust Badges — themed */}
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                <span
                  className={`text-slate-900 text-[10px] sm:text-[11px] font-extrabold px-2.5 py-1 rounded-full border flex items-center gap-1.5 shadow-xs transition-colors duration-500 ${theme.trustBadgeBg} ${theme.trustBadgeBorder}`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Instant
                  verification
                </span>
                <span
                  className={`text-slate-900 text-[10px] sm:text-[11px] font-extrabold px-2.5 py-1 rounded-full border flex items-center gap-1.5 shadow-xs transition-colors duration-500 ${theme.trustBadgeBg} ${theme.trustBadgeBorder}`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Zero hidden
                  charges
                </span>
                <span
                  className={`text-slate-900 text-[10px] sm:text-[11px] font-extrabold px-2.5 py-1 rounded-full border flex items-center gap-1.5 shadow-xs transition-colors duration-500 ${theme.trustBadgeBg} ${theme.trustBadgeBorder}`}
                >
                  <Lock className="w-3.5 h-3.5 text-emerald-600" /> 256-Bit SSL
                  Encrypted
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* TRUST METRICS STRIP */}
        <div className="mt-14 pt-8 border-t border-slate-200/80 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/85 backdrop-blur-sm rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
              <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
            </div>
            <div>
              <div className="text-sm font-black text-slate-950">4.9 / 5 Rating</div>
              <div className="text-[11px] text-slate-500 font-medium">350+ Active Partners</div>
            </div>
          </div>

          <div className="bg-white/85 backdrop-blur-sm rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-black text-slate-950">100% Territory Lock</div>
              <div className="text-[11px] text-slate-500 font-medium">Instant Exclusivity</div>
            </div>
          </div>

          <div className="bg-white/85 backdrop-blur-sm rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-black text-slate-950">PCI-DSS Level 1</div>
              <div className="text-[11px] text-slate-500 font-medium">Cashfree 256-Bit SSL</div>
            </div>
          </div>

          <div className="bg-white/85 backdrop-blur-sm rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-black text-slate-950">24/7 Dedicated Ops</div>
              <div className="text-[11px] text-slate-500 font-medium">Personal TRM Assigned</div>
            </div>
          </div>
        </div>

        {/* SECTION 1: VERIFIED REVIEWS & TESTIMONIALS */}
        <section className="mt-14">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <div
              className={`inline-flex items-center gap-1.5 border text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-2xs mb-2 transition-colors ${theme.badgePillBg} ${theme.badgePillBorder} ${theme.badgePillText}`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Real Partner Experiences</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              Hear From Our <span className={theme.brandAccent}>Franchise Partners</span>
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-600">
              Entrepreneurs across India who reserved their territories and scaled with BroomBoom.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {CHECKOUT_REVIEWS.map((r, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-0.5">
                      {[...Array(r.rating)].map((_, s) => (
                        <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      {r.earnings}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-normal">
                    &ldquo;{r.review}&rdquo;
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2.5">
                  <div className="relative w-9 h-9 rounded-full overflow-hidden border border-amber-300 shrink-0">
                    <Image src={r.avatar} alt={r.name} fill className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-slate-900 truncate">{r.name}</span>
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    </div>
                    <p className="text-[10px] text-slate-500 truncate">{r.city}</p>
                    <span className="text-[9px] font-extrabold text-amber-700 uppercase tracking-wider block">
                      {r.package}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 2: FREQUENTLY ASKED QUESTIONS */}
        <section className="mt-14 max-w-4xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <div
              className={`inline-flex items-center gap-1.5 border text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-2xs mb-2 transition-colors ${theme.badgePillBg} ${theme.badgePillBorder} ${theme.badgePillText}`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Questions & Answers</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              Frequently Asked <span className={theme.brandAccent}>Questions</span>
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-600">
              Everything you need to know about payments, territory locking, and the next steps.
            </p>
          </div>

          <div className="space-y-3">
            {CHECKOUT_FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs transition-all duration-200"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 font-bold text-slate-900 text-sm hover:text-amber-700 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-amber-600" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 pt-1 text-xs sm:text-[13px] text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 3: NEED HELP CALL DESK BANNER */}
        <div className="mt-12 bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-2xs max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-amber-100/70 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-black text-slate-950">Need Help Before Paying?</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Our Senior Franchise Desk is ready to verify your territory and answer payment queries.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href="tel:18002706600"
              className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white text-xs font-bold py-3 px-4 rounded-xl transition-all shadow-sm"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>6289952418</span>
            </a>
            <a
              href="https://api.whatsapp.com/send?phone=916289952418&text=Hello%20BroomBoom%20Team%2C%20I%20have%20a%20question%20regarding%20checkout%20and%20payment%20for%20the%20franchise."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-3 px-4 rounded-xl transition-all shadow-sm"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp Desk</span>
            </a>
          </div>
        </div>
      </main>

      {/* Footer minimal */}
      <footer className="mt-16 border-t border-slate-200/80 py-8 text-center text-xs text-slate-500 bg-white/70 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <span>BroomBoom Mobility Technologies Ltd.</span>
            <span>•</span>
            <span className="text-[11px] text-slate-500 font-normal">Official Franchise Checkout Portal</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>100% Encrypted Payment</span>
            <span>•</span>
            <span>Toll-Free: 6289952418</span>
            <span>•</span>
            <span>support@broomboomcabs.com</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FFFDF2]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">
              Loading BroomBoom Franchise Checkout...
            </p>
          </div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}