import { handleOptions, jsonResponse } from "@/lib/cors";
import { db } from "@/lib/db";
import {
  getCashfreeOrder,
  getCashfreeOrderPayments,
} from "@/lib/cashfree";
import { sendPaymentSuccessEmail } from "@/lib/email";
import {
  saveFranchiseLeadToPostgres,
} from "@/lib/db/postgres";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("order_id");

    if (!orderId) {
      return jsonResponse(
        {
          success: false,
          error: "Missing order_id parameter",
        },
        400
      );
    }

    // --------------------------------------------------
    // 1. Get Cashfree order
    // --------------------------------------------------

    const order = await getCashfreeOrder(orderId);

    // --------------------------------------------------
    // 2. Get Cashfree payments
    // --------------------------------------------------

    const payments = await getCashfreeOrderPayments(orderId);

    const successfulPayment =
      payments.find((p) => p.payment_status === "SUCCESS") ||
      payments[0] ||
      null;

    // --------------------------------------------------
    // 3. Determine payment status
    // --------------------------------------------------

    const isPaid =
      order.order_status === "PAID" ||
      successfulPayment?.payment_status === "SUCCESS";

    // --------------------------------------------------
    // 4. Locate matching lead
    // --------------------------------------------------

    let lead = null;

    const customerId = order.customer_details?.customer_id;

    if (customerId && !customerId.startsWith("cust_")) {
      lead = db.leads.getById(customerId);
    }

    // Fallback: search by mobile number
    if (!lead && order.customer_details?.customer_phone) {
      const allLeads = db.leads.getAll().leads;

      const customerPhone =
        order.customer_details.customer_phone.slice(-10);

      lead =
        allLeads.find((l) =>
          l.mobile.includes(customerPhone)
        ) || null;
    }

    // --------------------------------------------------
    // 5. If payment successful, update lead
    // --------------------------------------------------

    if (isPaid && lead) {
      try {
        db.leads.update(lead.id, {
          status: "approved",

          adminNotes:
            `[PAYMENT VERIFIED] Online reservation token ₹${order.order_amount} ` +
            `paid successfully via Cashfree. ` +
            `Order ID: ${order.order_id}, ` +
            `CF Payment ID: ${
              successfulPayment?.cf_payment_id || "N/A"
            }`,
        });

        // Refresh lead after update
        lead = db.leads.getById(lead.id) || lead;

        // Persist updated lead to PostgreSQL
        await saveFranchiseLeadToPostgres(lead).catch(
          (err: any) => {
            console.warn(
              "[POSTGRES WARNING] Failed to persist paid lead update:",
              err.message
            );
          }
        );
      } catch (e: any) {
        console.warn(
          "[DB WARNING] Failed to update lead payment status:",
          e.message
        );
      }

      // --------------------------------------------------
      // 6. Send payment success email
      // --------------------------------------------------

      try {
        await sendPaymentSuccessEmail({
          orderId: order.order_id,

          cfPaymentId:
            successfulPayment?.cf_payment_id ||
            order.cf_order_id,

          amount: order.order_amount,

          paymentMethod:
            successfulPayment?.payment_group ||
            "Online Gateway (Cashfree)",

          lead,

          paidAt:
            successfulPayment?.payment_completion_time,
        });
      } catch (mailErr: any) {
        console.warn(
          "[EMAIL WARNING] Could not send payment success email:",
          mailErr.message
        );
      }
    }

    // --------------------------------------------------
    // 7. Determine final payment status
    // --------------------------------------------------

    const paymentStatus:
      | "SUCCESS"
      | "FAILED"
      | "PENDING" = isPaid
      ? "SUCCESS"
      : order.order_status === "ACTIVE"
      ? "PENDING"
      : "FAILED";

    // --------------------------------------------------
    // 8. Return verification response
    // --------------------------------------------------

    return jsonResponse({
      success: true,

      verified: isPaid,

      orderStatus: order.order_status,

      orderAmount: order.order_amount,

      orderCurrency: order.order_currency,

      orderId: order.order_id,

      cfOrderId: order.cf_order_id,

      paymentDetails: successfulPayment,

      lead: lead
        ? {
            id: lead.id,

            applicationId:
              lead.applicationId,

            fullName:
              lead.fullName,

            city:
              lead.city,

            state:
              lead.state,

            preferredPackage:
              lead.preferredPackage,

            packageName:
              lead.packageName,

            mobile:
              lead.mobile,

            email:
              lead.email,
          }
        : {
            fullName:
              order.customer_details?.customer_name,

            mobile:
              order.customer_details?.customer_phone,

            email:
              order.customer_details?.customer_email,

            applicationId:
              "BB-FRANCHISE",

            city:
              "Territory Reserved",
          },
    });
  } catch (error: any) {
    console.error(
      "[CASHFREE VERIFY ERROR]:",
      error
    );

    return jsonResponse(
      {
        success: false,

        error:
          error.message ||
          "Failed to verify Cashfree order",
      },
      500
    );
  }
}