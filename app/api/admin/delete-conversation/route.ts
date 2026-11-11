import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function verifyAdminSession(token: string, secret: string) {
  const parts = token.split(":");
  if (parts.length !== 3) return false;

  const [identity, expiresText, signature] = parts;

  if (
    identity !== "admin" ||
    !/^\d+$/.test(expiresText) ||
    !/^[a-f0-9]{64}$/.test(signature)
  ) {
    return false;
  }

  const expectedSignature = createHmac("sha256", secret)
    .update(`${identity}:${expiresText}`)
    .digest("hex");

  const supplied = Buffer.from(signature, "hex");
  const expected = Buffer.from(expectedSignature, "hex");

  return (
    supplied.length === expected.length &&
    timingSafeEqual(supplied, expected) &&
    Number(expiresText) > Math.floor(Date.now() / 1000)
  );
}

export async function POST(request: Request) {
  try {
    const secret = process.env.MSPACE_ADMIN_SESSION_SECRET;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SECRET_KEY;

    if (!secret || !url || !key) {
      return NextResponse.json(
        { error: "Server configuration is incomplete." },
        { status: 500 }
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("mspace_admin_session")?.value;

    if (!token || !verifyAdminSession(token, secret)) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => null);
    const conversationId = body?.conversationId;

    if (
      typeof conversationId !== "string" ||
      !conversationId.trim() ||
      conversationId.length > 200
    ) {
      return NextResponse.json(
        { error: "A valid conversation ID is required." },
        { status: 400 }
      );
    }

    const supabase = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data, error } = await supabase.rpc(
      "delete_conversation_for_all",
      {
        p_conversation_id: conversationId.trim(),
      }
    );

    if (error) {
      console.error(
        "Admin conversation deletion failed:",
        error.message
      );

      return NextResponse.json(
        { error: "Unable to delete this conversation." },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Conversation not found or already deleted." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin conversation deletion failed:", error);

    return NextResponse.json(
      { error: "Unable to delete this conversation." },
      { status: 500 }
    );
  }
}