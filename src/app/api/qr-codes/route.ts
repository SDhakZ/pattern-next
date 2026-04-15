import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/features/lib/supabase";
import { generateToken } from "@/features/lib/tokenUtils";

export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase is not configured" },
        { status: 500 },
      );
    }

    // Optional: Add authentication check here
    // const session = await getServerSession()
    // if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json();
    const { redirectUrl, metadata } = body;

    if (!redirectUrl) {
      return NextResponse.json(
        { error: "redirectUrl is required" },
        { status: 400 },
      );
    }

    // Generate token and hash
    const { token, hash } = generateToken();

    // Calculate expiry time
    const expiryHours = parseInt(process.env.QR_TOKEN_EXPIRY_HOURS || "24");
    const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000);

    // Store in database
    const { data, error } = await supabase
      .from("qr_codes")
      .insert({
        token_hash: hash,
        status: "unused",
        redirect_url: redirectUrl,
        expires_at: expiresAt.toISOString(),
        payload: metadata || {},
      })
      .select("id")
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to create QR code" },
        { status: 500 },
      );
    }

    // Return QR code URL and metadata
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_BASE_URL || request.nextUrl.origin;
    const qrUrl = `${baseUrl}/qr/${token}`;

    return NextResponse.json({
      id: data.id,
      qrUrl,
      token, // Only for UI generation; don't expose beyond this response
      expiresAt,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
