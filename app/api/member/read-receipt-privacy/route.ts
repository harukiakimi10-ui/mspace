
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import {
  MEMBER_SESSION_COOKIE,
  verifyMemberSession,
} from "@/lib/server/memberSession";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(MEMBER_SESSION_COOKIE)?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required." },
        {
          status: 401,
          headers: { "Cache-Control": "no-store" },
        }
      );
    }

    const session = verifyMemberSession(token);

    if (!session) {
      return NextResponse.json(
        { error: "Invalid or expired session." },
        {
          status: 401,
          headers: { "Cache-Control": "no-store" },
        }
      );
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SECRET_KEY;

    if (!url || !key) {
      return NextResponse.json(
        { error: "Server configuration is incomplete." },
        {
          status: 500,
          headers: { "Cache-Control": "no-store" },
        }
      );
    }

    const supabase = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data, error } = await supabase
      .from("members")
      .select("member_id, hide_read_receipts, banned")
      .eq("member_id", session.memberId)
      .maybeSingle();

    if (error) {
      console.error(
        "Member read receipt setting lookup failed:",
        error.message
      );

      return NextResponse.json(
        { error: "Unable to load read receipt settings." },
        {
          status: 500,
          headers: { "Cache-Control": "no-store" },
        }
      );
    }


       if (!data || data.banned) {
      return NextResponse.json(
        { error: "Member session is no longer valid." },
        {
          status: 401,
          headers: { "Cache-Control": "no-store" },
        }
      );
    }

   const { data: globalSettings, error: globalSettingsError } =
      await supabase
        .from("settings")
        .select("hide_read_receipts")
        .eq("id", 1)
        .single();

    if (globalSettingsError) {
      console.error(
        "Global read receipt setting lookup failed:",
        globalSettingsError.message
      );

      return NextResponse.json(
        { error: "Unable to load read receipt settings." },
        {
          status: 500,
          headers: { "Cache-Control": "no-store" },
        }
      );
    }

        return NextResponse.json(
      {
        hideReadReceipts: data.hide_read_receipts === true,
        hideReadReceiptsForEveryone:
          globalSettings.hide_read_receipts === true,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
    } catch (error) {
    console.error(
      "Member read receipt setting request failed:",
      error
    );

    return NextResponse.json(
      { error: "Unable to load read receipt settings." },
      {
        status: 500,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }
}
