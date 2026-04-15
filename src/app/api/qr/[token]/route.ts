import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/features/lib/supabase";
import { hashToken } from "@/features/lib/tokenUtils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase is not configured" },
        { status: 500 },
      );
    }

    const { token } = await params;

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Hash the token for lookup
    const tokenHash = hashToken(token);

    // Find the QR code
    const { data: qrCode, error: fetchError } = await supabase
      .from("qr_codes")
      .select("*")
      .eq("token_hash", tokenHash)
      .single();

    if (fetchError || !qrCode) {
      return NextResponse.json(
        { error: "QR code not found", status: "invalid" },
        { status: 404 },
      );
    }

    // Check if expired
    const now = new Date();
    const expiresAt = new Date(qrCode.expires_at);

    if (now > expiresAt) {
      return NextResponse.json(
        {
          error: "QR code has expired",
          status: "expired",
          expiresAt: qrCode.expires_at,
        },
        { status: 410 },
      );
    }

    // Check if already used
    if (qrCode.status === "used" || qrCode.used_at) {
      return NextResponse.json(
        {
          error: "QR code has already been used",
          status: "already-used",
          usedAt: qrCode.used_at,
        },
        { status: 410 },
      );
    }

    // Mark as used (atomic update)
    const { error: updateError } = await supabase
      .from("qr_codes")
      .update({
        status: "used",
        used_at: new Date().toISOString(),
        scan_count: (qrCode.scan_count || 0) + 1,
      })
      .eq("id", qrCode.id)
      .eq("status", "unused"); // Ensure it's still unused (atomic check)

    if (updateError) {
      console.error("Update error:", updateError);
      // Check again to see if it was just used by another request
      const { data: updated } = await supabase
        .from("qr_codes")
        .select("status, used_at")
        .eq("id", qrCode.id)
        .single();

      if (updated?.status === "used") {
        return NextResponse.json(
          {
            error: "QR code was already used",
            status: "already-used",
            usedAt: updated.used_at,
          },
          { status: 410 },
        );
      }
    }

    // Success: redirect or return data
    return NextResponse.json({
      status: "success",
      message: "QR code validated successfully",
      redirectUrl: qrCode.redirect_url,
      payload: qrCode.payload,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
