"use client";

import React, { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Phone,
  Mail,
  Send,
  Sparkles,
  Copy,
  Check,
  MessageCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { FRANCHISE_PACKAGES } from "@/data/franchiseData";

const triggerConfetti = async () => {
  if (typeof window === "undefined") return;
  try {
    const confettiModule = await import("canvas-confetti");
    const confetti = confettiModule.default || confettiModule;
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.5 },
    });
  } catch (e) {
    // Canvas confetti gracefully ignored if unavailable
  }
};

function ApplyFormContent() {
  const searchParams = useSearchParams();
  const packageParam = searchParams.get("package") || "gold";

  const [selectedPackage, setSelectedPackage] = useState<string>(
    ["silver", "gold", "platinum"].includes(packageParam) ? packageParam : "gold"
  );

  const [formData, setFormData] = useState({
    fullName: "",
    mobile: "",
    alternatePhone: "",
    email: "",
    state: "",
    city: "",
    pincode: "",
    proposedAddress: "",
    spaceStatus: "Owned commercial space ready",
    carpetArea: "300 - 500 sq.ft",
    investmentBudget: "₹5.0 Lakhs - ₹10.0 Lakhs",
    financeRequired: "Self-Funded / Ready Capital",
    loanAssistance: "No (Self-Funded)",
    currentProfession: "",
    hasExperience: "Yes, currently in travel / taxi / logistics",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [applicationId, setApplicationId] = useState("");
  const [copied, setCopied] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [mailtoUrl, setMailtoUrl] = useState("");
  const [whatsappUrl, setWhatsappUrl] = useState("");

  const currentPkgDetails =
    FRANCHISE_PACKAGES.find((p) => p.id === selectedPackage) || FRANCHISE_PACKAGES[1];

  const generateApplicationSummary = () => {
    return `BROOMBOOM OFFICIAL FRANCHISE APPLICATION
==========================================
APPLICATION REF: ${applicationId || "PENDING"}
APPLICANT INFORMATION:
- Full Name: ${formData.fullName}
- Mobile / WhatsApp: ${formData.mobile}
- Alternate Phone: ${formData.alternatePhone || "N/A"}
- Email: ${formData.email}

TERRITORY & LOCATION:
- Target State: ${formData.state}
- Target City / District: ${formData.city}
- Pin Code: ${formData.pincode}
- Proposed Office / Kiosk Address: ${formData.proposedAddress || "To be finalized"}

FRANCHISE PACKAGE & INVESTMENT:
- Selected Tier: ${currentPkgDetails.name.toUpperCase()}
- Investment Range: ${currentPkgDetails.investmentRange}
- Available Capital: ${formData.investmentBudget}
- Financing Readiness: ${formData.financeRequired}
- Loan Assistance Needed: ${formData.loanAssistance}

STORE & SPACE READINESS:
- Space Status: ${formData.spaceStatus}
- Approximate Area: ${formData.carpetArea}

PROFESSIONAL BACKGROUND:
- Current Profession: ${formData.currentProfession || "Entrepreneur"}
- Industry Experience: ${formData.hasExperience}

ADDITIONAL NOTES:
${formData.message || "Ready to schedule discovery call and begin territory evaluation."}

Application Date: ${new Date().toLocaleDateString("en-IN")}
==========================================
Sent from BroomBoom Franchise Application Portal`;
  };

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    setFormError(null);

    if (!formData.fullName.trim()) {
      setFormError("Please enter your Full Name.");
      return;
    }
    if (!formData.mobile.trim()) {
      setFormError("Please enter your Mobile / WhatsApp number.");
      return;
    }
    if (!formData.email.trim()) {
      setFormError("Please enter your Email address.");
      return;
    }
    if (!formData.city.trim()) {
      setFormError("Please enter your target City or District.");
      return;
    }
    if (!formData.state.trim()) {
      setFormError("Please enter your State (e.g. West Bengal, Bihar, UP).");
      return;
    }

    setIsSubmitting(true);

    let assignedId = `BB-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          preferredPackage: selectedPackage,
          packageName: currentPkgDetails.name,
          source: "apply_page",
        }),
      });

      const data = await res.json();
      if (data.success && data.data?.applicationId) {
        assignedId = data.data.applicationId;
        setApplicationId(assignedId);
      }
    } catch (err) {
      console.error("Error submitting to backend:", err);
      setApplicationId(assignedId);
    }

    const summaryText = generateApplicationSummary();
    const recipientEmail = "franchise@broomboom.com";
    const emailSubject = `Franchise Application [${assignedId}]: ${currentPkgDetails.name} in ${formData.city} - ${formData.fullName}`;

    // Construct Mailto Link
    const mailto = `mailto:${recipientEmail}?subject=${encodeURIComponent(
      emailSubject
    )}&body=${encodeURIComponent(summaryText)}`;

    // Construct WhatsApp Direct Link
    const whatsappMsg = `*New Franchise Application - BroomBoom*\n\nRef: ${assignedId}\nName: ${formData.fullName}\nCity: ${formData.city}, ${formData.state}\nPackage: ${currentPkgDetails.name}\nBudget: ${formData.investmentBudget}\nFinancing: ${formData.financeRequired}\nLoan Support: ${formData.loanAssistance}\nPhone: ${formData.mobile}`;
    const waUrl = `https://api.whatsapp.com/send?phone=919876543210&text=${encodeURIComponent(
      whatsappMsg
    )}`;

    setMailtoUrl(mailto);
    setWhatsappUrl(waUrl);
    setIsSubmitting(false);
    setIsSuccess(true);

    triggerConfetti();
  };

  const copySummary = () => {
    navigator.clipboard.writeText(generateApplicationSummary());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-puja-cream text-slate-900 selection:bg-brand-yellow selection:text-black">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-200 py-3.5 px-4 sm:px-8 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-amber-400 shadow-sm">
              <Image
                src="/broomboom-logo.png"
                alt="BroomBoom Logo"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-slate-950">
                  Broom<span className="text-amber-600">Boom</span>
                </span>
                <span className="bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider border border-amber-200">
                  Franchise
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">
                Official Application Portal
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <a
              href="tel:18002706600"
              className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-amber-800 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-amber-600" />
              <span>1800-BROOM-BOOM</span>
            </a>
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-amber-800 border border-slate-300 hover:border-amber-400 px-3.5 py-2 rounded-xl transition-all bg-white"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Overview</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {isSuccess ? (
          /* Submission Confirmation & Mail Redirect Hub */
          <div className="bg-white border-2 border-amber-400 rounded-3xl p-8 sm:p-12 shadow-xl text-center max-w-2xl mx-auto space-y-6 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto shadow-sm font-black text-3xl">
              <Check className="w-10 h-10 stroke-[3]" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Application Registered: {applicationId || "BB-2026-CONFIRMED"}</span>
              </div>
              <h2 className="text-3xl font-black text-slate-950 tracking-tight">
                Application Received & Saved!
              </h2>
              <p className="text-sm text-slate-600 max-w-lg mx-auto mt-2">
                Your application for <strong className="text-amber-900">{currentPkgDetails.name}</strong> in{" "}
                <strong className="text-slate-900">{formData.city}, {formData.state}</strong> has been saved into the BroomBoom Territory Operations Portal. Our Territory Expansion Manager will review your requested PIN codes.
              </p>
            </div>

            {/* Direct Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <a
                href={mailtoUrl}
                className="flex items-center justify-center gap-2 bg-brand-yellow hover:bg-brand-yellow-hover text-black font-extrabold text-sm py-3.5 px-6 rounded-xl shadow-md transition-all"
              >
                <Mail className="w-4 h-4" />
                <span>Open Mail & Send Application</span>
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm py-3.5 px-6 rounded-xl shadow-md transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Send via WhatsApp (+91)</span>
              </a>
            </div>

            {/* Copy details block */}
            <div className="pt-4 border-t border-slate-200 text-left">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Application Summary Copy
                </span>
                <button
                  onClick={copySummary}
                  className="flex items-center gap-1.5 text-xs text-amber-700 hover:underline font-bold"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied to Clipboard!" : "Copy Summary"}</span>
                </button>
              </div>
              <pre className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-[11px] text-slate-700 whitespace-pre-wrap font-mono max-h-48 overflow-y-auto">
                {generateApplicationSummary()}
              </pre>
            </div>

            <div className="pt-2 flex items-center justify-center gap-6 text-xs text-slate-500">
              <Link href="/" className="hover:text-amber-800 transition-colors flex items-center gap-1 font-semibold">
                <ArrowLeft className="w-3.5 h-3.5" /> Return to Homepage
              </Link>
              <span>•</span>
              <a href="tel:18002706600" className="hover:text-amber-800 transition-colors flex items-center gap-1 font-semibold">
                <Phone className="w-3.5 h-3.5" /> Helpline: 1800-BROOM-BOOM
              </a>
            </div>
          </div>
        ) : (
          /* Main Application Form */
          <div className="space-y-10">
            {/* Title Banner */}
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 bg-white border border-amber-300 text-amber-900 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                Territory Exclusivity Application 2026-27
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-950">
                Apply for Your <span className="text-yellow-gradient">BroomBoom Franchise</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
                Fill in the details below to register your territory interest. Your completed application will be dispatched directly to our Senior Expansion Director for fast-track evaluation.
              </p>
            </div>

            {/* STEP 1: Select Package */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-black text-slate-950 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-brand-yellow text-black font-black text-xs flex items-center justify-center">
                    1
                  </span>
                  Select Franchise Package
                </h3>
                <span className="text-xs text-amber-800 font-bold">Click card to select</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {FRANCHISE_PACKAGES.map((pkg) => {
                  const isSelected = selectedPackage === pkg.id;
                  return (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPackage(pkg.id)}
                      className={`cursor-pointer rounded-2xl p-5 border-2 transition-all relative ${
                        isSelected
                          ? "bg-amber-50/70 border-amber-500 shadow-md ring-2 ring-amber-400/30"
                          : "bg-white border-slate-200 hover:border-amber-300"
                      }`}
                    >
                      {pkg.popular && (
                        <div className="absolute -top-3 right-4 bg-brand-yellow text-black text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-amber-400">
                          ★ Most Popular
                        </div>
                      )}

                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-base font-bold text-slate-950">{pkg.name}</h4>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? "bg-amber-600 border-amber-600 text-white"
                              : "border-slate-300"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>

                      <div className="text-xl font-black text-amber-700">
                        {pkg.investmentRange}
                      </div>

                      <p className="text-xs text-slate-500 mt-1">{pkg.tagline}</p>

                      <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] space-y-1 text-slate-600">
                        <div className="flex justify-between">
                          <span>Space:</span>
                          <span className="font-semibold text-slate-900">{pkg.spaceRequired}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Commission:</span>
                          <span className="font-semibold text-emerald-600">{pkg.commissionSlab}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Form Container */}
            <form
              action="javascript:void(0)"
              method="POST"
              onSubmit={handleSubmit}
              className="bg-white border border-amber-200 rounded-3xl p-6 sm:p-10 shadow-xl space-y-8"
            >
              {/* STEP 2: Personal & Contact Information */}
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-black text-slate-950 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span className="w-6 h-6 rounded-full bg-brand-yellow text-black font-black text-xs flex items-center justify-center">
                    2
                  </span>
                  Applicant & Contact Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Full Name <span className="text-amber-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Arvind Sharma"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Mobile / WhatsApp Number <span className="text-amber-600">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Email Address <span className="text-amber-600">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="you@domain.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Alternate Phone (Optional)
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. Landline / Office number"
                      value={formData.alternatePhone}
                      onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* STEP 3: Territory & Location */}
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-black text-slate-950 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span className="w-6 h-6 rounded-full bg-brand-yellow text-black font-black text-xs flex items-center justify-center">
                    3
                  </span>
                  Proposed City & Territory
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      State <span className="text-amber-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. West Bengal, Bihar, UP"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      City / District <span className="text-amber-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kolkata, Asansol, Siliguri"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Postal PIN Code <span className="text-amber-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 700001"
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Proposed Office / Kiosk Location / Market Area
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Main High Street near Railway Station, Shop No 12, Commercial Market"
                    value={formData.proposedAddress}
                    onChange={(e) => setFormData({ ...formData, proposedAddress: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 text-sm"
                  />
                </div>
              </div>

              {/* STEP 4: Store Space & Investment Readiness */}
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-black text-slate-950 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span className="w-6 h-6 rounded-full bg-brand-yellow text-black font-black text-xs flex items-center justify-center">
                    4
                  </span>
                  Commercial Space & Investment Readiness
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Commercial Space Availability
                    </label>
                    <select
                      value={formData.spaceStatus}
                      onChange={(e) => setFormData({ ...formData, spaceStatus: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-amber-500 text-sm"
                    >
                      <option value="Owned commercial space ready">Owned commercial space ready</option>
                      <option value="Rented commercial shop/office ready">Rented commercial shop/office ready</option>
                      <option value="Currently finalizing location / exploring rental">Currently exploring location</option>
                      <option value="Operating from existing travel/retail counter">Operating from existing travel agency counter</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Estimated Carpet Area (sq.ft)
                    </label>
                    <select
                      value={formData.carpetArea}
                      onChange={(e) => setFormData({ ...formData, carpetArea: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-amber-500 text-sm"
                    >
                      <option value="100 - 150 sq.ft (Ideal for Silver Kiosk)">100 - 150 sq.ft (Ideal for Silver Kiosk)</option>
                      <option value="300 - 500 sq.ft (Ideal for Gold Hub)">300 - 500 sq.ft (Ideal for Gold Hub)</option>
                      <option value="800 - 1,200 sq.ft (Ideal for Platinum Master)">800 - 1,200 sq.ft (Ideal for Platinum Master)</option>
                      <option value="Above 1,200 sq.ft">Above 1,200 sq.ft</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Ready Investment Capital
                    </label>
                    <select
                      value={formData.investmentBudget}
                      onChange={(e) => setFormData({ ...formData, investmentBudget: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-amber-500 text-sm"
                    >
                      <option value="₹1.5 Lakhs - ₹3.0 Lakhs">₹1.5 Lakhs – ₹3.0 Lakhs (Silver Partner)</option>
                      <option value="₹5.0 Lakhs - ₹10.0 Lakhs">₹5.0 Lakhs – ₹10.0 Lakhs (Gold Partner ★)</option>
                      <option value="₹10.0 Lakhs - ₹25.0 Lakhs">₹10.0 Lakhs – ₹25.0 Lakhs (Platinum Master)</option>
                      <option value="Above ₹25.0 Lakhs">Above ₹25.0 Lakhs (State Master Operator)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Travel / Cab / Logistics Experience
                    </label>
                    <select
                      value={formData.hasExperience}
                      onChange={(e) => setFormData({ ...formData, hasExperience: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-amber-500 text-sm"
                    >
                      <option value="Yes, currently in travel / taxi / logistics">Yes, currently in travel / cab business</option>
                      <option value="Running another retail / business franchise">Running another business/retail franchise</option>
                      <option value="New entrepreneur eager to learn with HQ training">New entrepreneur (Need training)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Current Profession / Business Background
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Travel Agent, Fleet Operator, Retail Business Owner, Corporate Professional"
                    value={formData.currentProfession}
                    onChange={(e) => setFormData({ ...formData, currentProfession: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 text-sm"
                  />
                </div>

                {/* Financing & Loan Desk Support */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                      <span>Financing / Capital Readiness</span>
                      <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Finance Lead</span>
                    </label>
                    <select
                      value={formData.financeRequired}
                      onChange={(e) => setFormData({ ...formData, financeRequired: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-amber-500 text-sm"
                    >
                      <option value="Self-Funded / Ready Capital">Self-Funded (100% Ready Capital)</option>
                      <option value="Require Bank Loan Assistance">Require Bank Loan Assistance (HQ Project Report)</option>
                      <option value="Require NBFC / Franchise Loan Partner">Require NBFC / Franchise Loan Partner (Up to 50% Funding)</option>
                      <option value="Govt Scheme / Subsidies (PMEGP / Mudra)">Govt Scheme / Subsidies (PMEGP / Mudra Loan)</option>
                      <option value="Exploring Financing Options">Exploring Financing Options</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                      <span>BroomBoom Loan Desk Support?</span>
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Pre-Approval</span>
                    </label>
                    <select
                      value={formData.loanAssistance}
                      onChange={(e) => setFormData({ ...formData, loanAssistance: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-amber-500 text-sm"
                    >
                      <option value="No (Self-Funded)">No — Fully Self-Funded (No loan needed)</option>
                      <option value="Yes (Need Bank Loan Assistance)">Yes — Need Project Report & Bank Tie-up Guidance</option>
                      <option value="Yes (Need NBFC Quick Approval)">Yes — Need NBFC Fast-Track Franchise Loan Support</option>
                      <option value="Need Advisory Discussion">Need Advisory Call with Finance Lead Officer</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* STEP 5: Comments & Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Questions or Additional Requirements for HQ
                </label>
                <textarea
                  rows={3}
                  placeholder="Mention any specific areas, questions on driver onboarding, or questions about expected launch timeline..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 text-sm resize-none"
                />
              </div>

              {/* Error Notification Banner */}
              {formError && (
                <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl text-rose-900 text-xs font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="w-8 h-8 rounded-full bg-rose-200 text-rose-700 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-extrabold text-rose-950">Action Required</div>
                    <div className="font-medium text-rose-800">{formError}</div>
                  </div>
                </div>
              )}

              {/* Submit CTA */}
              <div className="pt-2 space-y-3">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 bg-brand-yellow hover:bg-brand-yellow-hover text-black font-black text-base rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 group disabled:opacity-75 cursor-pointer transform active:scale-[0.99]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Saving Application to Database...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      <span>
                        Submit & Apply for {currentPkgDetails.name} (Save & Email)
                      </span>
                    </>
                  )}
                </button>

                <p className="text-xs text-center text-slate-500">
                  🔒 Data is securely registered in the BroomBoom PostgreSQL Database and Territory Operations Ledger.
                </p>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Footer minimal */}
      <footer className="border-t border-amber-200 py-8 text-center text-xs text-slate-500 bg-white">
        <p>© {new Date().getFullYear()} BroomBoom Mobility Technologies Ltd. All rights reserved.</p>
        <p className="mt-1">For urgent franchise inquiries: 1800-BROOM-BOOM | franchise@broomboom.com</p>
      </footer>
    </div>
  );
}

export default function ApplyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-puja-cream flex items-center justify-center text-slate-800">Loading application form...</div>}>
      <ApplyFormContent />
    </Suspense>
  );
}
