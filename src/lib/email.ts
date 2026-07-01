import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.MAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export async function sendOtpEmail(to: string, otp: string): Promise<void> {
  try {
    await transporter.sendMail({
      from: `"Saree Elegance" <${process.env.MAIL_USER || "noreply@saree-elegance.com"}>`,
      to,
      subject: "Your OTP for Login - Saree Elegance",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#faf5ef;border-radius:12px;border:1px solid #d4a53433">
          <div style="text-align:center;margin-bottom:28px">
            <h1 style="font-family:Georgia,serif;color:#1a1a2e;font-size:24px;margin:0">Saree Elegance</h1>
            <p style="color:#d4a534;font-size:13px;letter-spacing:2px;text-transform:uppercase;margin:4px 0 0">Secure Login</p>
          </div>
          <p style="color:#4a4a5e;font-size:15px;line-height:1.6">Your one-time password for login is:</p>
          <div style="text-align:center;margin:24px 0;padding:16px;background:#fff;border-radius:8px;border:1px solid #d4a53433">
            <span style="font-size:36px;font-weight:700;letter-spacing:8px;color:#d4a534;font-family:monospace">${otp}</span>
          </div>
          <p style="color:#999;font-size:13px">This OTP expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
          <hr style="border:none;border-top:1px solid #d4a53433;margin:24px 0" />
          <p style="color:#bbb;font-size:12px;text-align:center">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });
    console.log(`[EMAIL] OTP sent to ${to}`);
  } catch (error) {
    console.warn(`[EMAIL] Failed to send OTP to ${to}:`, (error as Error).message);
    console.warn(`[EMAIL] OTP for ${to} (dev fallback): ${otp}`);
  }
}
