
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  MEMBER_SESSION_COOKIE,
  createMemberSession,
  verifyMemberSession,
} from "@/lib/server/memberSession";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(MEMBER_SESSION_COOKIE)?.value;

    if (!token) {
      return NextResponse.json(
        { authenticated: false },
        {
          status: 401,
          headers: { "Cache-Control": "no-store" },
        }
      );
    }

    const session = verifyMemberSession(token);

    if (!session) {
      const response = NextResponse.json(
        { authenticated: false },
        {
          status: 401,
          headers: { "Cache-Control": "no-store" },
        }
      );

      response.cookies.set(MEMBER_SESSION_COOKIE, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 0,
        expires: new Date(0),
      });

      return response;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseSecret = process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !supabaseSecret) {
      return NextResponse.json(
        { error: "Server configuration is incomplete." },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseSecret, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data: member, error } = await supabase
      .from("members")
      .select("member_id, banned")
      .eq("member_id", session.memberId)
      .maybeSingle();

    if (error) {
      console.error("Member session lookup failed:", error.message);

      return NextResponse.json(
        { error: "Unable to verify member session." },
        { status: 500 }
      );
    }

    if (!member || member.banned) {
      const response = NextResponse.json(
        { authenticated: false },
        {
          status: 401,
          headers: { "Cache-Control": "no-store" },
        }
      );

      response.cookies.set(MEMBER_SESSION_COOKIE, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 0,
        expires: new Date(0),
      });

      return response;
    }

    return NextResponse.json(
      {
        authenticated: true,
        memberId: member.member_id,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Member session verification failed:", error);

    return NextResponse.json(
      { error: "Unable to verify member session." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const memberId =
      typeof body?.memberId === "string" ? body.memberId.trim() : "";
    const deviceId =
      typeof body?.deviceId === "string" ? body.deviceId.trim() : "";

    if (!memberId || !deviceId) {
      return NextResponse.json(
        { error: "Member and device information are required." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseSecret = process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !supabaseSecret) {
      return NextResponse.json(
        { error: "Server configuration is incomplete." },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseSecret, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data: member, error } = await supabase
      .from("members")
      .select("member_id, device_id, banned")
      .eq("member_id", memberId)
      .maybeSingle();

    if (error) {
      console.error("Member session creation lookup failed:", error.message);
      return NextResponse.json(
        { error: "Unable to verify member." },
        { status: 500 }
      );
    }

    if (
      !member ||
      member.banned ||
      !member.device_id ||
      member.device_id !== deviceId
    ) {
      return NextResponse.json(
        { error: "Member verification failed." },
        { status: 403 }
      );
    }

    const token = createMemberSession(member.member_id);
    const response = NextResponse.json(
      { authenticated: true, memberId: member.member_id },
      { headers: { "Cache-Control": "no-store" } }
    );

    response.cookies.set(MEMBER_SESSION_COOKIE, token.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 365 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("Member session creation failed:", error);
    return NextResponse.json(
      { error: "Unable to create member session." },
      { status: 500 }
    );
  }
}