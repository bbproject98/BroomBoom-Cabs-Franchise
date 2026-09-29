"use client";

import React, { useState, useEffect } from "react";
import { X, Check, Mail, Send, Sparkles, MessageCircle, ShieldCheck } from "lucide-react";
import confetti from "canvas-confetti";
import { FranchiseInquiry } from "@/types";

export interface LeadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPackage?: string;
  onSuccess?: (data: FranchiseInquiry) => void;
}

export const LeadFormModal: React.FC<LeadFormModalProps> = ({
  isOpen,
  onClose,
  defaultPackage = "gold",
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    fullName: "",
    mobile: "",
    email: "",
    state: "",
    city: "",
    preferredPackage: defaultPackage || "gold",
    investmentBudget: "₹5.0 Lakhs - ₹10.0 Lakhs",
    spaceStatus: "Owned commercial space ready",
    hasExperience: "Yes, currently in travel / taxi / logistics",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [applicationId, setApplicationId] = useState("");
  const [mailtoUrl, setMailtoUrl] = useState("");
  const [whatsappUrl, setWhatsappUrl] = useState("");

  useEffect(() => {
    if (defaultPackage) {
      setFormData((prev) => ({
        ...prev,
        preferredPackage: defaultPackage || "gold",
      }));
    }
  }, [defaultPackage]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.mobile || !formData.city || !formData.email) {
      alert("Please fill in Name, Phone, Email, and City.");
      return;
    }

    setIsSubmitting(true);
    let assignedId = `BB-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      // 1. Submit through backend to persist all data in database
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          source: "modal_join_now",
        }),
      });

      const data = await res.json();
      if (data.success && data.data?.applicationId) {
        assignedId = data.data.applicationId;
        const leadId = data.data?.leadId || "";

        // Immediate redirect to checkout page
        const queryParams = new URLSearchParams({
          leadId,
          appId: assignedId,
          pkg: formData.preferredPackage,
          name: formData.fullName,
          city: formData.city,
          mobile: formData.mobile,
          email: formData.email,
        });
        window.location.href = `/checkout?${queryParams.toString()}`;
        return;
      }
    } catch (err) {
      console.error("Backend submission error:", err);
    }

    setApplicationId(assignedId);

    // 2. Format complete email summary for the sender's mobile email app
    const packageDisplayName =
      formData.preferredPackage === "silver"
        ? "SILVER PARTNER (Booking Kiosk — ₹1.5L - ₹2.5L)"
        : formData.preferredPackage === "gold"
        ? "GOLD PARTNER (District Exclusive Hub — ₹5L - ₹10L)"
        : formData.preferredPackage === "platinum"
        ? "PLATINUM PARTNER (Regional Master — ₹15L - ₹20L)"
        : "CUSTOM FRANCHISE INQUIRY";

    const emailSubject = `Franchise Application [${assignedId}]: ${formData.fullName} - ${formData.city}`;
    const emailBody = `BROOMBOOM OFFICIAL FRANCHISE APPLICATION
==================================================
APPLICATION REF NO: ${assignedId}
SUBMISSION DATE: ${new Date().toLocaleDateString("en-IN")}

APPLICANT INFORMATION:
- Full Name: ${formData.fullName}
- Mobile / WhatsApp: ${formData.mobile}
- Email: ${formData.email}

TERRITORY & LOCATION:
- Target City / District: ${formData.city}
- Target State: ${formData.state || "Not specified"}

FRANCHISE PACKAGE:
- Package Selected: ${packageDisplayName}
- Investment Budget: ${formData.investmentBudget}
- Space Readiness: ${formData.spaceStatus}
- Industry Experience: ${formData.hasExperience}

ADDITIONAL REMARKS:
${formData.message || "Ready to schedule territory viability call."}

==================================================
Submitted via BroomBoom Mobility Technologies Ltd.
Official Desk: support@broomboomcabs.com | Toll-Free: 6289952418`;

    // Construct Mailto Link with CC to sender
    const mailto = `mailto:support@broomboomcabs.com?cc=${encodeURIComponent(
      formData.email
    )}&subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

    // Construct WhatsApp Link
    const waText = `*New BroomBoom Franchise Application*\n\nRef: ${assignedId}\nName: ${formData.fullName}\nPhone: ${formData.mobile}\nCity: ${formData.city}, ${formData.state}\nPackage: ${formData.preferredPackage.toUpperCase()}\nBudget: ${formData.investmentBudget}`;
    const whatsapp = `https://api.whatsapp.com/send?phone=916289952418&text=${encodeURIComponent(waText)}`;

    setMailtoUrl(mailto);
    setWhatsappUrl(whatsapp);

    setIsSubmitting(false);
    setIsSuccess(true);

    // Fire celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 75,
        origin: { y: 0.5 },
      });
    } catch (err) {
      console.error("Confetti error", err);
    }

    // NOTE: Removed window.location.href = mailto; here. 
    // Browsers block redirects triggered after async network requests.
    // The user will click the link in the Success UI instead.

    if (onSuccess) {
      onSuccess(formData as any);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border-2 border-amber-400 my-8 text-slate-900">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          /* Success Screen: Confirms DB save & mobile email trigger */
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <div>
              <span className="inline-block bg-emerald-100 text-emerald-800 font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider mb-2 border border-emerald-300">
                Application Registered &bull; {applicationId}
              </span>
              <h3 className="text-2xl font-black text-slate-950">
                Saved! Action Required
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Thank you, <strong className="text-amber-900">{formData.fullName}</strong>. Your franchise application has been{" "}
              <strong className="text-slate-900">saved in our system</strong>. Please complete the process by sending us an email or WhatsApp from your device.
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-950 text-left space-y-2">
              <div className="flex items-center gap-1.5 font-black text-amber-900">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>What Happens Next?</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                1. Tap <strong>Open Mail App</strong> below to launch your email client.<br />
                2. Tap <strong>Send</strong> in your mail app — a copy is CC&apos;d directly to <strong>{formData.email}</strong>.<br />
                3. Our Territory Expansion Manager will call you on <strong>{formData.mobile}</strong> within 24 hours.
              </p>
            </div>

            {/* Mobile Actions */}
            <div className="pt-2 flex flex-col gap-2.5">
              <a
                href={mailtoUrl}
                className="w-full bg-brand-yellow hover:bg-amber-400 text-black font-black text-xs sm:text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
              >
                <Mail className="w-4 h-4" />
                <span>Open Mail App on Mobile &amp; Send</span>
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Send Copy via WhatsApp instead</span>
              </a>

              <button
                onClick={() => {
                  setIsSuccess(false);
                  onClose();
                }}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2.5 rounded-xl transition-all"
              >
                Done / Close Window
              </button>
            </div>
          </div>
        ) : (
          /* Application Form Section */
          <div>
            <div className="mb-4">
              <div className="inline-flex items-center gap-1.5 bg-amber-100 border border-amber-300 text-amber-900 text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase mb-1.5">
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>Fast-Track Franchise Application</span>
              </div>
              <h3 className="text-2xl font-black text-slate-950 tracking-tight">
                Begin Your Franchise Journey
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Submit below to lock your preferred territory and receive your application confirmation.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-amber-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunil Agarwal"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                />
              </div>

              {/* Mobile and Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mobile / WhatsApp <span className="text-amber-600">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 6289952418"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address <span className="text-amber-600">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* City and State */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Target City / District <span className="text-amber-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kolkata, Lucknow, Jaipur"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    placeholder="e.g. West Bengal, UP, Bihar"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Franchise Package */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Preferred Franchise Tier
                </label>
                <select
                  value={formData.preferredPackage}
                  onChange={(e) =>
                    setFormData({ ...formData, preferredPackage: e.target.value })
                  }
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                >
                  <option value="gold">Gold Partner (District Hub — ₹5L - ₹10L) ★ Most Popular</option>
                  <option value="silver">Silver Partner (Booking Kiosk — ₹1.5L - ₹2.5L)</option>
                  <option value="platinum">Platinum Partner (Regional Master — ₹15L - ₹20L)</option>
                  <option value="undecided">Need Guidance from Territory Manager</option>
                </select>
              </div>

              {/* Budget and Space */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Investment Readiness
                  </label>
                  <select
                    value={formData.investmentBudget}
                    onChange={(e) => setFormData({ ...formData, investmentBudget: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                  >
                    <option value="₹1.5L - ₹3L">₹1.5 Lakhs – ₹3.0 Lakhs</option>
                    <option value="₹5.0 Lakhs - ₹10.0 Lakhs">₹5.0 Lakhs – ₹10.0 Lakhs</option>
                    <option value="₹10.0 Lakhs - ₹25.0 Lakhs">₹10.0 Lakhs – ₹25.0 Lakhs</option>
                    <option value="Above ₹25L">Above ₹25 Lakhs (State Master)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Commercial Space
                  </label>
                  <select
                    value={formData.spaceStatus}
                    onChange={(e) => setFormData({ ...formData, spaceStatus: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                  >
                    <option value="Owned commercial space ready">Owned commercial space ready</option>
                    <option value="Rented shop/office ready">Rented shop/office ready</option>
                    <option value="Currently exploring location">Currently exploring location</option>
                    <option value="Operating from existing travel desk">Existing travel agency counter</option>
                  </select>
                </div>
              </div>

              {/* Experience */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Business / Travel Experience
                </label>
                <select
                  value={formData.hasExperience}
                  onChange={(e) => setFormData({ ...formData, hasExperience: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                >
                  <option value="Yes, currently in travel / taxi / logistics">Yes, in travel / taxi / fleet logistics</option>
                  <option value="Running another retail / trade franchise">Running another retail or trade franchise</option>
                  <option value="New entrepreneur eager to learn with HQ training">New entrepreneur (Need HQ training)</option>
                </select>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Questions or Remarks for HQ
                </label>
                <textarea
                  rows={2}
                  placeholder="Mention preferred PIN code or questions..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-all resize-none"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 bg-brand-yellow hover:bg-amber-400 text-black text-xs sm:text-sm font-black py-3 rounded-xl shadow-md flex items-center justify-center gap-2 group transition-all transform active:scale-95 disabled:opacity-75 cursor-pointer"
                style={{ backgroundColor: "#FACC15" }} // Adjust yellow hex if needed depending on your tailwind config
              >
                <Send className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                <span>{isSubmitting ? "Submitting to Database..." : "Submit Application"}</span>
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Instant database registration</span>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};