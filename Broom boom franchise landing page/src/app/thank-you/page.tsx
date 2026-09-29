"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  Home,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Loader2,
  Copy,
  Check,
} from "lucide-react";

const triggerConfetti = async () => {
  if (typeof window === "undefined") return;
  try {
    const confettiModule = await import("canvas-confetti");
    const confetti = confettiModule.default || confettiModule;
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.4 },
    });
  } catch (e) {
    // Canvas confetti gracefully handled
  }
};

function ThankYouContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("order_id");

  const [loading, setLoading] = useState(true);
  const [verifyData, setVerifyData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      setError("No order ID found in verification URL.");
      return;
    }

    // Call backend to verify payment with Cashfree
    fetch(`/api/payment/verify?order_id=${encodeURIComponent(orderId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setVerifyData(data);
          if (data.verified) {
            triggerConfetti();
          }
        } else {
          setError(data.error || "Failed to verify order details with payment gateway.");
        }
      })
      .catch((err) => {
        console.error("Verification error:", err);
        setError("Network error while verifying payment. Please refresh or contact support.");
      })
      .finally(() => setLoading(false));
  }, [orderId]);

  const copyOrderId = () => {
    if (orderId) {
      navigator.clipboard.writeText(orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-puja-cream flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border-2 border-amber-300 shadow-sm text-center max-w-md w-full">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin mx-auto mb-4" />
          <h2 className="text-lg font-black text-slate-900">Verifying Payment with Cashfree...</h2>
          <p className="text-xs text-slate-500 mt-1">Please wait a moment while we confirm your transaction securely.</p>
        </div>
      </div>
    );
  }

  const isPaid = verifyData?.verified === true;
  const lead = verifyData?.lead || {};
  const payment = verifyData?.paymentDetails || {};
  const amount = verifyData?.orderAmount || 0;

  return (
    <div className="min-h-screen bg-puja-cream text-slate-900 selection:bg-brand-yellow selection:text-black font-sans pb-20 print:bg-white print:p-0">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-200 py-3.5 px-4 sm:px-8 shadow-sm print:hidden">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-amber-400 shadow-sm bg-white shrink-0">
              <Image src="/broomboom-logo.png" alt="BroomBoom Logo" fill className="object-contain p-0.5" priority />
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
              <p className="text-[10px] text-slate-500 font-medium">Payment & Application Confirmation</p>
            </div>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-amber-800 border border-slate-300 hover:border-amber-400 px-3 py-1.5 rounded-xl transition-all bg-white"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-10">
        {isPaid ? (
          /* SUCCESS STATE */
          <div className="space-y-6">
            {/* Celebration Banner */}
            <div className="bg-white rounded-3xl border-2 border-emerald-300 p-7 sm:p-9 shadow-md text-center relative overflow-hidden">
              <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-9 h-9 text-emerald-600" />
              </div>

              <span className="inline-block bg-emerald-100 text-emerald-900 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider mb-2 border border-emerald-300">
                Payment Verified • Territory Confirmed
              </span>

              <h1 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight">
                Welcome to the BroomBoom Family!
              </h1>

              <p className="text-sm text-slate-600 max-w-lg mx-auto mt-2 leading-relaxed">
                Your full franchise package fee payment of{" "}
                <strong className="text-slate-950">₹{amount.toLocaleString("en-IN")}</strong> has been successfully
                confirmed. Your territory is officially locked and reserved.
              </p>
            </div>

            {/* Official Payment Receipt Card */}
            <div className="bg-white rounded-3xl border-2 border-amber-300 p-6 sm:p-7 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Official Payment Receipt
                </h3>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-950 py-1 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors print:hidden cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Receipt
                </button>
              </div>

              <div className="py-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Order Reference ID</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="font-mono font-bold text-slate-950">{orderId}</span>
                    <button
                      type="button"
                      onClick={copyOrderId}
                      className="text-slate-400 hover:text-slate-700 print:hidden cursor-pointer"
                      title="Copy Order ID"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {payment?.cf_payment_id && (
                  <div>
                    <span className="text-slate-400 block font-medium">Cashfree Transaction ID</span>
                    <span className="font-mono font-bold text-slate-950 block mt-0.5">{payment.cf_payment_id}</span>
                  </div>
                )}

                <div>
                  <span className="text-slate-400 block font-medium">Franchise Tier</span>
                  <span className="font-bold text-slate-950 text-sm block mt-0.5">
                    {lead.packageName || "Franchise Partner"}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium">Reserved Territory</span>
                  <span className="font-bold text-slate-950 block mt-0.5">
                    {lead.city ? `${lead.city}, ${lead.state || "India"}` : "Confirmed Territory"}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium">Applicant Name</span>
                  <span className="font-bold text-slate-950 block mt-0.5">{lead.fullName || "Partner"}</span>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium">Payment Mode</span>
                  <span className="font-bold text-slate-950 block mt-0.5">
                    {payment?.payment_group || "Online Gateway (Cashfree PG)"}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between items-center bg-slate-50 -mx-6 -mb-6 p-6 rounded-b-2xl">
                <div>
                  <span className="text-xs text-slate-500 font-medium block">Total Amount Paid</span>
                  <span className="text-[11px] text-emerald-700 font-semibold">Payment Status: Confirmed</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-slate-950">₹{amount.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            {/* Next Steps Roadmap */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                What Happens Next?
              </h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-950">Senior Territory Manager Call (within 24 hours)</h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Our Head of Expansion will call your registered number (<strong>{lead.mobile}</strong>) to finalize
                      the designated territorial boundaries and hub coordinates.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-950">Formal Franchise Agreement & Legal Pack</h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      We will dispatch the official BroomBoom franchise documentation, agreement drafts, and territory
                      certificate to your registered email (<strong>{lead.email || "your email"}</strong>).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-950">Onboarding & Software Access</h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Receive your BroomBoom Partner Admin Portal credentials, branding signage kits, and driver onboarding
                      guidelines to launch operations.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 print:hidden">
              <a
                href="https://api.whatsapp.com/send?phone=916289952418&text=Hi%20BroomBoom%20Team%2C%20I%20have%20completed%20the%20franchise%20reservation%20token%20payment%20(Order%3A%20${orderId}).%20Please%20guide%20me%20on%20next%20steps."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl text-xs transition-colors shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                Connect on WhatsApp Support
              </a>

              <Link
                href="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-xl text-xs transition-colors shadow-sm"
              >
                <Home className="w-4 h-4" />
                Back to BroomBoom Home
              </Link>
            </div>
          </div>
        ) : (
          /* PENDING / FAILED STATE */
          <div className="bg-white rounded-3xl border border-amber-200 p-8 shadow-sm text-center">
            <div className="w-16 h-16 rounded-full bg-amber-100 border-2 border-amber-300 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-9 h-9 text-amber-600" />
            </div>

            <span className="inline-block bg-amber-100 text-amber-900 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
              Payment Incomplete or Cancelled
            </span>

            <h1 className="text-2xl font-black text-slate-950 mt-1">
              Your Reservation Payment is Awaiting Completion
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-2 leading-relaxed">
              We did not receive a completed payment confirmation from Cashfree. If money was debited, it will be
              automatically credited or updated shortly.
            </p>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 max-w-sm mx-auto my-6 text-xs text-left">
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Order ID:</span>
                <span className="font-mono font-bold text-slate-900">{orderId}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Status:</span>
                <span className="font-bold text-amber-700">{verifyData?.orderStatus || "INCOMPLETE"}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => router.push(`/checkout?appId=${lead.applicationId || ""}&pkg=${lead.preferredPackage || "gold"}`)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-3 px-6 rounded-xl text-xs transition-colors cursor-pointer"
              >
                <span>Retry Payment</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <Link
                href="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-6 rounded-xl text-xs transition-colors"
              >
                Return to Home
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-600">Verifying transaction...</p>
          </div>
        </div>
      }
    >
      <ThankYouContent />
    </Suspense>
  );
}
