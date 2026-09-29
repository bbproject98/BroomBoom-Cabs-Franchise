import nodemailer from "nodemailer";
import { FranchiseLead, BrochureDownload } from "./db/schema";

/**
 * Returns a configured nodemailer transporter using Gmail SMTP.
 */
export function getMailTransporter() {
  const user = process.env.GMAIL_USER || "support@broomboomcabs.com";
  const pass = process.env.GMAIL_APP_PASSWORD || "";

  if (!user || !pass) {
    console.warn("[EMAIL WARNING] GMAIL_USER or GMAIL_APP_PASSWORD is not set in environment.");
    return null;
  }

  // Google App Passwords can be 16 characters separated by spaces; remove whitespace
  const cleanPass = pass.replace(/\s+/g, "");

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass: cleanPass,
    },
  });
}

/**
 * Retrieves the admin destination email where notifications are sent.
 */
export function getAdminEmail(): string {
  return (
    process.env.ADMIN_NOTIFICATION_EMAIL ||
    process.env.GMAIL_USER ||
    "support@broomboomcabs.com"
  );
}

/**
 * Low-level sender helper
 */
async function sendMailHelper(options: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const transporter = getMailTransporter();
    if (!transporter) {
      console.warn("[EMAIL WARNING] Transporter unavailable. Skipping send.");
      return { success: false, error: "Transporter not configured" };
    }

    const senderEmail = process.env.GMAIL_USER || "support@broomboomcabs.com";

    const info = await transporter.sendMail({
      from: `"BroomBoom Franchise System" <${senderEmail}>`,
      to: options.to,
      replyTo: options.replyTo || senderEmail,
      subject: options.subject,
      html: options.html,
    });

    console.log(`[EMAIL SUCCESS] Sent to ${options.to} (ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.warn(`[EMAIL WARNING] Failed to send email to ${options.to}:`, err.message || err);
    return { success: false, error: err.message || "Failed to send email" };
  }
}

/**
 * Sends a rich notification email to admin when a new franchise lead/application is submitted.
 */
export async function sendLeadNotificationEmail(
  lead: FranchiseLead
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const adminEmail = getAdminEmail();
  const subject = `🚗 [New Franchise Lead] ${lead.applicationId} - ${lead.fullName} (${lead.city}, ${lead.state || "India"})`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
    .container { max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
    .header { background: #0f172a; padding: 24px 30px; text-align: left; border-bottom: 4px solid #f59e0b; }
    .header h1 { color: #f8fafc; font-size: 22px; margin: 0 0 6px 0; font-weight: 700; }
    .header p { color: #94a3b8; font-size: 13px; margin: 0; }
    .badge { display: inline-block; background: #fef3c7; color: #92400e; font-weight: 600; padding: 4px 10px; border-radius: 9999px; font-size: 12px; margin-top: 8px; }
    .content { padding: 28px 30px; }
    .section-title { font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; color: #64748b; margin: 20px 0 10px 0; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px; }
    .grid { width: 100%; border-collapse: collapse; }
    .grid td { padding: 7px 4px; font-size: 14px; }
    .label { color: #64748b; font-weight: 600; width: 38%; }
    .value { color: #0f172a; font-weight: 500; }
    .highlight-box { background: #fef9c3; border-left: 4px solid #eab308; padding: 14px 18px; border-radius: 6px; margin: 20px 0; }
    .footer { background: #f1f5f9; padding: 16px 30px; text-align: center; font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚖 BroomBoom Franchise - New Lead Received</h1>
      <p>A new franchise partnership inquiry has been submitted.</p>
      <div class="badge">Application ID: ${lead.applicationId}</div>
    </div>
    <div class="content">
      <div class="section-title">Applicant Details</div>
      <table class="grid">
        <tr><td class="label">Full Name:</td><td class="value"><strong>${lead.fullName}</strong></td></tr>
        <tr><td class="label">Mobile:</td><td class="value"><a href="tel:${lead.mobile}">${lead.mobile}</a></td></tr>
        <tr><td class="label">Email:</td><td class="value">${lead.email || "N/A"}</td></tr>
      </table>

      <div class="section-title">Territory & Package</div>
      <table class="grid">
        <tr><td class="label">City / Territory:</td><td class="value"><strong>${lead.city}, ${lead.state || "India"}</strong></td></tr>
        <tr><td class="label">Preferred Tier:</td><td class="value"><strong>${(lead.packageName || lead.preferredPackage).toUpperCase()}</strong></td></tr>
        <tr><td class="label">Budget:</td><td class="value">${lead.investmentBudget || "Not specified"}</td></tr>
      </table>

      <div class="highlight-box">
        <strong>Direct Action:</strong> Call applicant immediately at <a href="tel:${lead.mobile}"><strong>${lead.mobile}</strong></a>.
      </div>
    </div>
    <div class="footer">
      BroomBoom Cabs Franchise System &bull; Delivered to ${adminEmail}
    </div>
  </div>
</body>
</html>
  `;

  return sendMailHelper({
    to: adminEmail,
    subject,
    html,
    replyTo: lead.email || undefined,
  });
}

/**
 * Sends confirmation email to applicant acknowledging application.
 */
export async function sendApplicantConfirmationEmail(
  lead: FranchiseLead
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!lead.email || !lead.email.includes("@")) {
    return { success: false, error: "No valid email" };
  }

  const subject = `Application Received: BroomBoom Cabs Franchise Partner (${lead.applicationId})`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
    .header { background: #0f172a; padding: 28px 30px; text-align: center; }
    .header h1 { color: #f59e0b; font-size: 24px; margin: 0 0 8px 0; font-weight: 800; }
    .header p { color: #cbd5e1; font-size: 14px; margin: 0; }
    .content { padding: 30px; line-height: 1.6; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px 20px; margin: 20px 0; }
    .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚖 BroomBoom Cabs</h1>
      <p>India's Fast-Growing Mobility & Logistics Franchise</p>
    </div>
    <div class="content">
      <h2 style="font-size: 18px; color: #0f172a; margin-top: 0;">Dear ${lead.fullName},</h2>
      <p>Thank you for choosing the <strong>BroomBoom Cabs Franchise Network</strong>. We have received your application.</p>
      <div class="card">
        <p style="margin: 4px 0;"><strong>Application ID:</strong> ${lead.applicationId}</p>
        <p style="margin: 4px 0;"><strong>Package:</strong> ${lead.packageName || lead.preferredPackage}</p>
        <p style="margin: 4px 0;"><strong>City:</strong> ${lead.city}, ${lead.state || "India"}</p>
      </div>
      <p>Our Senior Territory Manager will contact you within 24 to 48 hours.</p>
      <p>Warm regards,<br/><strong>BroomBoom Franchise Team</strong></p>
    </div>
    <div class="footer">
      BroomBoom Cabs &bull; Franchise Division
    </div>
  </div>
</body>
</html>
  `;

  return sendMailHelper({
    to: lead.email,
    subject,
    html,
  });
}

/**
 * Sends alert to admin when a brochure is downloaded.
 */
export async function sendBrochureNotificationEmail(
  brochure: BrochureDownload
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const adminEmail = getAdminEmail();
  const subject = `📄 [Brochure Download] ${brochure.name} (${brochure.city || "India"})`;

  const html = `
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; padding: 20px; color: #1e293b;">
  <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
    <h3 style="color: #0f172a; margin-top: 0;">📄 Brochure Download Logged</h3>
    <p><strong>Name:</strong> ${brochure.name}</p>
    <p><strong>Mobile:</strong> <a href="tel:${brochure.mobile}">${brochure.mobile}</a></p>
    <p><strong>City:</strong> ${brochure.city || "Not specified"}</p>
  </div>
</body>
</html>
  `;

  return sendMailHelper({
    to: adminEmail,
    subject,
    html,
  });
}

/**
 * Sends payment confirmation receipt to both admin and applicant.
 */
export interface PaymentSuccessEmailParams {
  orderId: string;
  cfPaymentId?: string;
  amount: number;
  paymentMethod?: string;
  lead: FranchiseLead;
  paidAt?: string;
}

export async function sendPaymentSuccessEmail(
  params: PaymentSuccessEmailParams
): Promise<{ success: boolean; error?: string }> {
  const { orderId, cfPaymentId, amount, paymentMethod, lead, paidAt } = params;
  const adminEmail = getAdminEmail();
  const formattedDate = paidAt || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  const subject = `🎉 [Franchise Token Paid - ₹${amount}] ${lead.applicationId} - ${lead.fullName} (${lead.city})`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
    .container { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
    .header { background: #0f172a; padding: 24px 30px; border-bottom: 4px solid #10b981; }
    .header h1 { color: #10b981; font-size: 22px; margin: 0 0 6px 0; }
    .header p { color: #cbd5e1; font-size: 14px; margin: 0; }
    .content { padding: 28px 30px; }
    .receipt-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 18px 20px; margin: 18px 0; }
    .grid { width: 100%; border-collapse: collapse; }
    .grid td { padding: 8px 4px; font-size: 14px; }
    .label { color: #64748b; font-weight: 600; width: 40%; }
    .value { color: #0f172a; font-weight: 500; }
    .amount-highlight { font-size: 24px; font-weight: 800; color: #059669; }
    .footer { background: #f1f5f9; padding: 16px 30px; text-align: center; font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Franchise Token Payment Confirmed!</h1>
      <p>A franchise applicant has completed the online territory reservation token payment.</p>
    </div>
    <div class="content">
      <div class="receipt-box">
        <div style="font-size: 12px; color: #047857; text-transform: uppercase; font-weight: 700;">Payment Amount</div>
        <div class="amount-highlight">₹${amount.toLocaleString("en-IN")}</div>
        <div style="font-size: 13px; color: #065f46; margin-top: 4px;">Status: <strong>PAID & VERIFIED</strong></div>
      </div>

      <h3 style="font-size: 15px; color: #0f172a; margin-top: 24px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">Payment Details</h3>
      <table class="grid">
        <tr><td class="label">Order ID:</td><td class="value"><code>${orderId}</code></td></tr>
        ${cfPaymentId ? `<tr><td class="label">Cashfree Reference:</td><td class="value"><code>${cfPaymentId}</code></td></tr>` : ""}
        <tr><td class="label">Payment Mode:</td><td class="value">${paymentMethod || "Online (Cashfree PG)"}</td></tr>
        <tr><td class="label">Payment Time:</td><td class="value">${formattedDate}</td></tr>
      </table>

      <h3 style="font-size: 15px; color: #0f172a; margin-top: 20px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">Applicant & Franchise Details</h3>
      <table class="grid">
        <tr><td class="label">Application ID:</td><td class="value"><strong>${lead.applicationId}</strong></td></tr>
        <tr><td class="label">Applicant Name:</td><td class="value"><strong>${lead.fullName}</strong></td></tr>
        <tr><td class="label">Mobile Phone:</td><td class="value"><a href="tel:${lead.mobile}" style="color: #2563eb; font-weight: 600;">${lead.mobile}</a></td></tr>
        <tr><td class="label">Email:</td><td class="value"><a href="mailto:${lead.email}">${lead.email || "N/A"}</a></td></tr>
        <tr><td class="label">Territory:</td><td class="value">${lead.city}, ${lead.state || "India"}</td></tr>
        <tr><td class="label">Selected Package:</td><td class="value"><strong>${lead.packageName || lead.preferredPackage}</strong></td></tr>
      </table>
    </div>
    <div class="footer">
      BroomBoom Cabs Franchise System &bull; Automatic Payment Receipt
    </div>
  </div>
</body>
</html>
  `;

  // Send to Admin
  await sendMailHelper({
    to: adminEmail,
    subject,
    html,
    replyTo: lead.email || undefined,
  });

  // Send to Applicant
  if (lead.email && lead.email.includes("@")) {
    await sendMailHelper({
      to: lead.email,
      subject: `Payment Receipt: BroomBoom Franchise Reservation (${lead.applicationId})`,
      html,
    });
  }

  return { success: true };
}