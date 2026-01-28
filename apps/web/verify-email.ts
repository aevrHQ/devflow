import { emailService } from "./lib/emails";

async function verifyEmail() {
  console.log("Starting Email Verification...");

  // Test 1: Fallback (Nodemailer) or Resend if configured
  // Pass a dummy email that won't actually send if credentials not set, but checks logic flow.
  try {
    const result = await emailService.sendStyledEmail(
      "test@example.com",
      "Test Email from DevFlow",
      {
        title: "Verification Test",
        content:
          "<p>This is a test email to verify the new service architecture.</p>",
        actionText: "Verify",
        actionUrl: "https://example.com",
      },
    );
    console.log("Send Result:", result);
  } catch (error) {
    console.error("Verification Error:", error);
  }
}

verifyEmail();
