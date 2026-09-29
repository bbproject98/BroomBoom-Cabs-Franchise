import { NextResponse } from "next/server";
import { handleOptions, jsonResponse } from "@/lib/cors";
import { db } from "@/lib/db";
import { createCashfreeOrder, getPackagePricing } from "@/lib/cashfree";

export async function OPTIONS() {
  return handleOptions();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { leadId, applicationId, packageTier, isSandboxTest, customAmount } = body;

    // Retrieve lead if available
    let lead = null;
    if (leadId) {
      lead = db.leads.getById(leadId);
    }
    if (!lead && applicationId) {
      const all = db.leads.getAll();
      lead = all.leads.find((l) => l.applicationId === applicationId) || null;
    }

    const tier = (packageTier || lead?.preferredPackage || "gold").toLowerCase();
    const pricing = getPackagePricing(tier);

    // Charge full package fee (no minimum / no token)
    let payableAmount = pricing.amount;
    if (isSandboxTest) {
      payableAmount = 1.00;
    } else if (customAmount && Number(customAmount) > 0) {
      payableAmount = Number(customAmount);
    }

    const orderId = `BB_FRAN_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;

    const host = request.headers.get("host") || "localhost:3000";
    const protocol = request.headers.get("x-forwarded-proto") || "http";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;
    const returnUrl = `${appUrl}/thank-you?order_id={order_id}`;

    const order = await createCashfreeOrder({
      orderId,
      orderAmount: payableAmount,
      orderCurrency: "INR",
      customerDetails: {
        customer_id: lead ? lead.id : `cust_${Date.now()}`,
        customer_name: lead?.fullName || body.fullName || "Franchise Partner",
        customer_email: lead?.email || body.email || "partner@broomboom.com",
        customer_phone: lead?.mobile || body.mobile || "9999999999",
      },
      returnUrl,
      orderNote: `BroomBoom Franchise Reservation - ${pricing.name} (${lead?.city || body.city || "India"})`,
    });

    return jsonResponse({
      success: true,
      data: {
        orderId: order.order_id,
        paymentSessionId: order.payment_session_id,
        orderAmount: order.order_amount,
        currency: order.order_currency,
        planName: pricing.name,
        packageTier: tier,
      },
    });
  } catch (error: any) {
    console.error("[CASHFREE API ERROR] Error creating order:", error);
    return jsonResponse(
      {
        success: false,
        error: error.message || "Failed to create payment order with Cashfree",
      },
      500
    );
  }
}
