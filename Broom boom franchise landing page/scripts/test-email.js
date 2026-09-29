const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

// 1. Manually parse .env if needed
const envPath = path.resolve(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx > 0) {
        const key = trimmed.substring(0, eqIdx).trim();
        let val = trimmed.substring(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[key] = val;
      }
    }
  }
}

const user = process.env.GMAIL_USER || "support@broomboomcabs.com";
const rawPass = process.env.GMAIL_APP_PASSWORD || "";
const pass = rawPass.replace(/\s+/g, "");

console.log("==================================================");
console.log("    BROOMBOOM GMAIL SMTP VERIFICATION TEST        ");
console.log("==================================================");
console.log(`• Configured Gmail Account: ${user}`);
console.log(`• Configured Password Length: ${pass.length} characters`);
console.log(`• Has whitespace removed: ${rawPass !== pass ? "Yes" : "No"}`);
console.log("--------------------------------------------------");

if (!user || !pass) {
  console.error("❌ ERROR: GMAIL_USER or GMAIL_APP_PASSWORD missing in .env");
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user,
    pass,
  },
});

async function main() {
  console.log("⏳ [1/2] Verifying SMTP authentication with Google...");
  try {
    await transporter.verify();
    console.log("✅ [SUCCESS] Gmail SMTP authentication verified successfully!");
  } catch (err) {
    console.error("❌ [AUTH FAILED] Could not authenticate with Google SMTP server.");
    console.error("Details:", err.message);

    if (err.message && (err.message.includes("534") || err.message.includes("535") || err.message.includes("BadCredentials") || err.message.includes("Application-specific") || err.message.includes("Username and Password not accepted"))) {
      console.log("\n=======================================================");
      console.log("💡 HOW TO FIX THIS (Google 16-Character App Password):");
      console.log("=======================================================");
      console.log("Google specifically responded: Application-specific password required.");
      console.log("To connect your Gmail, generate a 16-character App Password:");
      console.log("1. Open: https://myaccount.google.com/apppasswords");
      console.log("   (Make sure 2-Step Verification is ON in your Google account)");
      console.log("2. Type App Name 'BroomBoom' and click 'Create'.");
      console.log("3. Google will show a 16-character password (e.g., abcd efgh ijkl mnop).");
      console.log("4. In your .env file, replace Partha@212 with that 16-character password:");
      console.log(`   GMAIL_APP_PASSWORD="abcd efgh ijkl mnop"`);
      console.log("5. Re-run: node scripts/test-email.js");
      console.log("=======================================================\n");
    }
    process.exit(1);
  }

  console.log(`⏳ [2/2] Sending test dispatch to ${user}...`);
  try {
    const info = await transporter.sendMail({
      from: `"BroomBoom Franchise System" <${user}>`,
      to: user,
      subject: "🚖 BroomBoom Franchise - Email Dispatch Connection Verified",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f8fafc;">
          <div style="max-width: 500px; background: white; padding: 25px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <h2 style="color: #0f172a; margin-top: 0;">🎉 Gmail Connection Live!</h2>
            <p>Your Gmail account (<strong>${user}</strong>) has been successfully connected to the <strong>BroomBoom Cabs Franchise Portal</strong>.</p>
            <p>All future franchise inquiries, lead submissions, and brochure requests will be automatically delivered directly to this inbox.</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="font-size: 12px; color: #64748b;">Timestamp: ${new Date().toISOString()}</p>
          </div>
        </div>
      `,
    });

    console.log("✅ [DISPATCH SUCCESS] Test email delivered to your inbox!");
    console.log(`• Message ID: ${info.messageId}`);
    console.log(`• Response: ${info.response}`);
    console.log("\nAll future franchise leads will now be redirected to your mail.");
  } catch (err) {
    console.error("❌ [SEND ERROR] Failed to send message:", err.message);
  }
}

main();
