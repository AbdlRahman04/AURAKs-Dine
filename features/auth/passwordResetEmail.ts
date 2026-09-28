import { Resend } from "resend";

export function isPasswordResetEmailConfigured(): boolean {
  return Boolean(
    process.env.RESEND_API_KEY &&
    process.env.PASSWORD_RESET_FROM_EMAIL &&
    process.env.APP_URL,
  );
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.PASSWORD_RESET_FROM_EMAIL;
  const appUrl = process.env.APP_URL;
  if (!apiKey || !from || !appUrl) throw new Error("Password reset email is not configured");

  const resetUrl = new URL("/reset-password", appUrl);
  resetUrl.searchParams.set("token", token);

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: email,
    subject: "Reset your QuickDineFlow password",
    text: `Use this link within 30 minutes to reset your QuickDineFlow password: ${resetUrl.toString()}\n\nIf you did not request this, you can ignore this email.`,
    html: `<p>Use the link below within 30 minutes to reset your QuickDineFlow password.</p><p><a href="${resetUrl.toString()}">Reset password</a></p><p>If you did not request this, you can ignore this email.</p>`,
  });

  if (error) throw new Error("Resend password reset email failed");
}
