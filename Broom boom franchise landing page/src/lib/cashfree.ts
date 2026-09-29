/**
 * Cashfree Payment Gateway Integration Helper
 * PG API Version: 2023-08-01
 */

export interface CashfreeCustomerDetails {
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
}

export interface CreateOrderParams {
  orderId: string;
  orderAmount: number;
  orderCurrency?: string;
  customerDetails: CashfreeCustomerDetails;
  returnUrl: string;
  orderNote?: string;
}

export interface CashfreeOrderResponse {
  cf_order_id: string;
  order_id: string;
  entity: string;
  order_currency: string;
  order_amount: number;
  order_status: "ACTIVE" | "PAID" | "EXPIRED" | "TERMINATED";
  payment_session_id: string;
  order_expiry_time?: string;
  order_note?: string;
  customer_details: CashfreeCustomerDetails;
}

export function getCashfreeBaseUrl(): string {
  const env = (process.env.CASHFREE_ENV || "sandbox").toLowerCase();
  return env === "production"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";
}

export function getCashfreeHeaders(): HeadersInit {
  const appId = process.env.CASHFREE_APP_ID || "";
  const secretKey = process.env.CASHFREE_SECRET_KEY || "";

  if (!appId || !secretKey) {
    console.warn("[CASHFREE WARNING] CASHFREE_APP_ID or CASHFREE_SECRET_KEY is not set.");
  }

  return {
    "Content-Type": "application/json",
    "x-client-id": appId,
    "x-client-secret": secretKey,
    "x-api-version": "2023-08-01",
  };
}

/**
 * Creates an order in Cashfree PG
 */
export async function createCashfreeOrder(params: CreateOrderParams): Promise<CashfreeOrderResponse> {
  const baseUrl = getCashfreeBaseUrl();
  const headers = getCashfreeHeaders();

  // Sanitize phone number (Cashfree requires 10 digit Indian number)
  let cleanPhone = (params.customerDetails.customer_phone || "").replace(/\D/g, "");
  if (cleanPhone.length > 10) {
    cleanPhone = cleanPhone.slice(-10);
  }
  if (cleanPhone.length < 10) {
    cleanPhone = "9999999999";
  }

  const payload = {
    order_id: params.orderId,
    order_amount: Math.max(1, Number(params.orderAmount.toFixed(2))),
    order_currency: params.orderCurrency || "INR",
    customer_details: {
      customer_id: params.customerDetails.customer_id.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 50),
      customer_name: params.customerDetails.customer_name || "Franchise Applicant",
      customer_email: params.customerDetails.customer_email || "partner@broomboom.com",
      customer_phone: cleanPhone,
    },
    order_meta: {
      return_url: params.returnUrl,
    },
    order_note: params.orderNote || "BroomBoom Franchise Reservation Fee",
  };

  console.log(`[CASHFREE] Creating order ${params.orderId} for amount ₹${payload.order_amount}`);

  const res = await fetch(`${baseUrl}/orders`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("[CASHFREE ERROR] Failed to create order:", data);
    throw new Error(data.message || `Cashfree Order API returned ${res.status}`);
  }

  return data as CashfreeOrderResponse;
}

/**
 * Fetches order status from Cashfree
 */
export async function getCashfreeOrder(orderId: string): Promise<CashfreeOrderResponse> {
  const baseUrl = getCashfreeBaseUrl();
  const headers = getCashfreeHeaders();

  const res = await fetch(`${baseUrl}/orders/${encodeURIComponent(orderId)}`, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  const data = await res.json();

  if (!res.ok) {
    console.error(`[CASHFREE ERROR] Failed to fetch order ${orderId}:`, data);
    throw new Error(data.message || `Failed to fetch Cashfree order status: ${res.status}`);
  }

  return data as CashfreeOrderResponse;
}

/**
 * Fetches order payments from Cashfree
 */
export async function getCashfreeOrderPayments(orderId: string): Promise<any[]> {
  const baseUrl = getCashfreeBaseUrl();
  const headers = getCashfreeHeaders();

  try {
    const res = await fetch(`${baseUrl}/orders/${encodeURIComponent(orderId)}/payments`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn(`[CASHFREE WARNING] Could not fetch payments for ${orderId}:`, err);
    return [];
  }
}

/**
 * Pricing configurations for each franchise package tier
 */
export function getPackagePricing(packageTier: string) {
  const tier = (packageTier || "gold").toLowerCase();

  if (tier === "silver") {
    return {
      id: "silver",
      name: "Silver Partner",
      tagline: "Booking Kiosk & Express Travel Outlet",
      badge: "LOW INVESTMENT",
      originalPrice: 200000,
      amount: 100000,
      discount: "50% OFF",
      savings: 100000,
      formattedOriginalPrice: "₹2,00,000",
      formattedAmount: "₹1,00,000",
      formattedSavings: "₹1,00,000",
      benefitsCol1: [
        "Access to BroomBoom Partner Booking Console",
        "Instant offline passenger booking & POS software",
        "Daily & weekly automatic commission settlements",
        "Official counter branding kit (Backlit board, flyers)",
        "Standard 5-day agent software training",
      ],
      benefitsCol2: [
        "8% - 12% direct booking commission slab",
        "Airport transfer fixed markup commissions",
        "Driver referral bonus (₹500 per verified driver)",
        "Dedicated ticketing helpline & ops support",
        "GST and Gateway Charges is only Applicable",
      ],
    };
  } else if (tier === "platinum") {
    return {
      id: "platinum",
      name: "Platinum Partner",
      tagline: "Regional Master Franchise & State Hub",
      badge: "★ MASTER EXCLUSIVITY",
      originalPrice: 1500000,
      amount: 750000,
      discount: "50% OFF",
      savings: 750000,
      formattedOriginalPrice: "₹15,00,000",
      formattedAmount: "₹7,50,000",
      formattedSavings: "₹7,50,000",
      benefitsCol1: [
        "Master Territorial Exclusivity (Regional Zone / State)",
        "Sub-franchise development rights (Keep up to 40% fees)",
        "Perpetual royalty override on all sub-units in region",
        "HQ-funded hyper-local digital marketing ad campaigns",
        "15-day master operations & dispatch training",
      ],
      benefitsCol2: [
        "Driver partner onboarding & offline inspection station",
        "25%+ direct commission slab + sub-unit royalties",
        "EV Fleet integration & corporate accounts tie-up",
        "Dedicated Senior Relationship Manager & Board advisory",
        "GST and Gateway Charges is only Applicable",
      ],
    };
  }

  // Default: Gold Partner (Exclusive District Fleet & Hub Franchise)
  return {
    id: "gold",
    name: "Gold Partner",
    tagline: "Exclusive District Fleet & Hub Franchise",
    badge: "★ MOST POPULAR",
    originalPrice: 600000,
    amount: 300000,
    discount: "50% OFF",
    savings: 300000,
    formattedOriginalPrice: "₹6,00,000",
    formattedAmount: "₹3,00,000",
    formattedSavings: "₹3,00,000",
    benefitsCol1: [
      "Exclusive territory rights (protected geographical zone)",
      "Advanced Fleet & Dispatch Admin Dashboard",
      "2% - 4% recurring override on all rides starting in your zone",
      "BroomBoom digital marketing ad budget allocated by HQ",
      "10-day comprehensive management & operations training",
    ],
    benefitsCol2: [
      "Driver partner onboarding & offline Inspection station",
      "15% - 20% direct booking commission slab",
      "Complete 360° Office branding & interior design blue-print",
      "Dedicated Territory Relationship Manager (TRM)",
      "GST and Gateway Charges is only Applicable",
    ],
  };
}
