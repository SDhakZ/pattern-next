import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

type SendEmailBody = {
  to?: string;
  qrUrl?: string;
  expiresAt?: string | null;
};

const resendApiKey = process.env.RESEND_API_KEY || "";
const resendFrom =
  process.env.RESEND_FROM_EMAIL || "Patterns of Place <onboarding@resend.dev>";

const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function POST(request: NextRequest) {
  try {
    if (!resend) {
      return NextResponse.json(
        { error: "Resend is not configured" },
        { status: 500 },
      );
    }

    const body = (await request.json()) as SendEmailBody;
    const to = body.to?.trim();
    const qrUrl = body.qrUrl?.trim();

    if (!to) {
      return NextResponse.json(
        { error: "Recipient email is required" },
        { status: 400 },
      );
    }

    if (!qrUrl) {
      return NextResponse.json(
        { error: "QR download link is required" },
        { status: 400 },
      );
    }

    const expiresText = body.expiresAt
      ? `This link expires at ${new Date(body.expiresAt).toLocaleString()}.`
      : "This link can be used once and then expires.";

    const { error } = await resend.emails.send({
      from: resendFrom,
      to,
      subject: "Your Patterns of Place postcard download",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
          <h1 style="font-size: 24px; margin-bottom: 12px;">Your Patterns of Place postcard is ready</h1>
          <p style="margin: 0 0 16px;">${expiresText}</p>
          <p style="margin: 0 0 20px;">
            <a href="${qrUrl}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px;">Open download page</a>
          </p>
          <p style="margin: 0 0 8px; font-size: 14px; color: #444;">If the button does not work, copy this link:</p>
          <p style="word-break: break-all; font-size: 13px; color: #555;">${qrUrl}</p>
          <p style="margin-top: 20px; font-size: 12px; color: #666;">Download both the front and reverse SVG files from that page.</p>
        </div>
      `,
      text: [
        "Your Patterns of Place postcard is ready.",
        expiresText,
        `Open download page: ${qrUrl}`,
        "Download both the front and reverse SVG files from that page.",
      ].join("\n\n"),
    });

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to send email" },
        { status: 500 },
      );
    }

    return NextResponse.json({ status: "sent" });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
