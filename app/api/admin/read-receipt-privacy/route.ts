
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

async function getAdminSupabase() {
  const secret = process.env.MSPACE_ADMIN_SESSION_SECRET;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;

  if (!secret || !url || !key) {
    throw new Error("Server configuration is incomplete.");
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("mspace_admin_session")?.value;

  if (!token || !verifyAdminSession(token, secret)) {
    return { error: "Unauthorized" as const };
  }

  return {
    supabase: createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }),
  };
}

export async function GET() {
  try {
    const result = await getAdminSupabase();

    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        {
          status: 401,
          headers: { "Cache-Control": "no-store" },
        }
      );
    }

    const { data, error } = await result.supabase
      .from("settings")
      .select("hide_read_receipts")
      .eq("id", 1)
      .single();

    if (error) {
      console.error("Read receipt setting lookup failed:", error.message);

      return NextResponse.json(
        { error: "Unable to load read receipt settings." },
        {
          status: 500,
          headers: { "Cache-Control": "no-store" },
        }
      );
    }

    return NextResponse.json(
      { hideReadReceipts: data.hide_read_receipts === true },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Read receipt settings GET failed:", error);

    return NextResponse.json(
      { error: "Unable to load read receipt settings." },
      {
        status: 500,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }
}

export async function POST(request: Request) {
  try {
    const result = await getAdminSupabase();

    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        {
          status: 401,
          headers: { "Cache-Control": "no-store" },
        }
      );
    }

    const body = await request.json().catch(() => null);

    if (
      !body ||
      typeof body.hideReadReceipts !== "boolean"
    ) {
      return NextResponse.json(
        { error: "Invalid read receipt setting." },
        {
          status: 400,
          headers: { "Cache-Control": "no-store" },
        }
      );
    }

    const { error } = await result.supabase
      .from("settings")
      .update({
        hide_read_receipts: body.hideReadReceipts,
      })
      .eq("id", 1);

    if (error) {
      console.error("Read receipt setting update failed:", error.message);

      return NextResponse.json(
        { error: "Unable to save read receipt settings." },
        {
          status: 500,
          headers: { "Cache-Control": "no-store" },
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        hideReadReceipts: body.hideReadReceipts,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Read receipt settings POST failed:", error);

    return NextResponse.json(
      { error: "Unable to save read receipt settings." },
      {
        status: 500,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }
}
