
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

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
        { status: 401 }
      );
    }

    const { data: global, error: globalError } =
      await result.supabase
        .from("admin_presence_privacy")
        .select("hide_from_all")
        .eq("id", 1)
        .single();

    if (globalError) {
      console.error("Global member privacy lookup failed:", globalError.message);
      return NextResponse.json(
        { error: "Unable to load privacy settings." },
        { status: 500 }
      );
    }

    const { data: hiddenMembers, error: hiddenError } =
      await result.supabase
        .from("admin_presence_hidden_members")
        .select("member_id");

    if (hiddenError) {
      console.error("Hidden member lookup failed:", hiddenError.message);
      return NextResponse.json(
        { error: "Unable to load privacy settings." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        hideFromAll: global.hide_from_all,
        hiddenMemberIds: (hiddenMembers ?? []).map(
          (item) => item.member_id
        ),
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Member privacy GET failed:", error);
    return NextResponse.json(
      { error: "Unable to load privacy settings." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const result = await getAdminSupabase();

    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => null);

    if (!body || typeof body.action !== "string") {
      return NextResponse.json(
        { error: "Invalid request." },
        { status: 400 }
      );
    }

    if (
      body.action === "setGlobal" &&
      typeof body.hideFromAll === "boolean"
    ) {
      const { error } = await result.supabase
        .from("admin_presence_privacy")
        .update({
          hide_from_all: body.hideFromAll,
          updated_at: new Date().toISOString(),
        })
        .eq("id", 1);

      if (error) {
        console.error("Global privacy update failed:", error.message);
        return NextResponse.json(
          { error: "Unable to update global privacy." },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    }

    if (
      body.action === "setMember" &&
      typeof body.memberId === "string" &&
      body.memberId.trim().length > 0 &&
      body.memberId.length <= 200 &&
      typeof body.hidden === "boolean"
    ) {
      const memberId = body.memberId.trim();

      if (body.hidden) {
        const { error } = await result.supabase
          .from("admin_presence_hidden_members")
          .upsert(
            { member_id: memberId },
            { onConflict: "member_id", ignoreDuplicates: true }
          );

        if (error) {
          console.error("Member privacy update failed:", error.message);
          return NextResponse.json(
            { error: "Unable to update member privacy." },
            { status: 500 }
          );
        }
      } else {
        const { error } = await result.supabase
          .from("admin_presence_hidden_members")
          .delete()
          .eq("member_id", memberId);

        if (error) {
          console.error("Member privacy update failed:", error.message);
          return NextResponse.json(
            { error: "Unable to update member privacy." },
            { status: 500 }
          );
        }
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Invalid privacy action or parameters." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Member privacy POST failed:", error);
    return NextResponse.json(
      { error: "Unable to update privacy settings." },
      { status: 500 }
    );
  }
}
