
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const ADMIN_ID = "11111111-1111-1111-1111-111111111111";

function verifyAdminSession(token: string, secret: string) {
  const parts = token.split(":");

  if (parts.length !== 3) return false;

  const [identity, expiresText, signature] = parts;

  if (!/^[a-f0-9]{64}$/.test(signature)) return false;
  if (identity !== "admin" || !/^\d+$/.test(expiresText)) {
    return false;
  }

  const payload = `${identity}:${expiresText}`;
  const expectedSignature = createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  const supplied = Buffer.from(signature, "hex");
  const expected = Buffer.from(expectedSignature, "hex");

  return (
    supplied.length === expected.length &&
    timingSafeEqual(supplied, expected) &&
    Number(expiresText) > Math.floor(Date.now() / 1000)
  );
}



export async function GET() {
  try {
    const secret = process.env.MSPACE_ADMIN_SESSION_SECRET;

    if (!secret) {
      return NextResponse.json(
        { error: "Server configuration is incomplete." },
        { status: 500 }
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("mspace_admin_session")?.value;

    if (!token || !verifyAdminSession(token, secret)) {
      return NextResponse.json(
        {
          hidden: true,
          is_online: false,
          last_seen: null,
        },
        {
          status: 200,
          headers: { "Cache-Control": "no-store" },
        }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !supabaseSecretKey) {
      return NextResponse.json(
        { error: "Server configuration is incomplete." },
        { status: 500 }
      );
    }

    const supabase = createClient(
      supabaseUrl,
      supabaseSecretKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { data: privacy, error: privacyError } = await supabase
      .from("admin_presence_privacy")
      .select("hide_from_all")
      .eq("id", 1)
      .maybeSingle();

    if (privacyError) {
      console.error("Admin privacy lookup failed:", privacyError.message);

      return NextResponse.json(
        { error: "Unable to load Admin presence." },
        { status: 500 }
      );
    }

    if (privacy?.hide_from_all) {
      return NextResponse.json(
        {
          hidden: true,
          is_online: false,
          last_seen: null,
        },
        {
          headers: { "Cache-Control": "no-store" },
        }
      );
    }

    const { data: admin, error: adminError } = await supabase
      .from("admins")
      .select("is_online,last_seen")
      .eq("id", ADMIN_ID)
      .maybeSingle();

    if (adminError || !admin) {
      console.error(
        "Admin presence lookup failed:",
        adminError?.message
      );

      return NextResponse.json(
        { error: "Unable to load Admin presence." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        hidden: false,
        is_online: admin.is_online,
        last_seen: admin.last_seen,
      },
      {
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error) {
    console.error("Admin presence request failed:", error);

    return NextResponse.json(
      { error: "Unable to load Admin presence." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const secret = process.env.MSPACE_ADMIN_SESSION_SECRET;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

    if (!secret || !supabaseUrl || !supabaseSecretKey) {
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

    if (
      !body ||
      typeof body.online !== "boolean"
    ) {
      return NextResponse.json(
        { error: "A valid online status is required." },
        { status: 400 }
      );
    }

    const supabase = createClient(
      supabaseUrl,
      supabaseSecretKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { error } = await supabase
      .from("admins")
      .update({
        is_online: body.online,
        last_seen: new Date().toISOString(),
      })
      .eq("id", ADMIN_ID);

    if (error) {
      console.error("Admin presence update failed:", error.message);

      return NextResponse.json(
        { error: "Unable to update Admin presence." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin presence request failed:", error);

    return NextResponse.json(
      { error: "Unable to update Admin presence." },
      { status: 500 }
    );
  }
}
