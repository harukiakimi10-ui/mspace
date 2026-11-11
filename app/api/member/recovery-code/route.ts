import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

import {
  MEMBER_SESSION_COOKIE,
  verifyMemberSession,
} from "@/lib/server/memberSession";

import {
  generateRecoveryCode,
  encryptRecoveryCode,
  decryptRecoveryCode,
  hashRecoveryCredentials,
} from "@/lib/server/memberRecovery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(MEMBER_SESSION_COOKIE)?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      );
    }

    const session = verifyMemberSession(token);

    if (!session) {
      return NextResponse.json(
        { error: "Invalid or expired session." },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      );
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SECRET_KEY;

    if (!url || !key) {
      return NextResponse.json(
        { error: "Server configuration is incomplete." },
        { status: 500, headers: { "Cache-Control": "no-store" } }
      );
    }

    const supabase = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data: member, error: memberError } = await supabase
      .from("members")
      .select("member_id, name, banned")
      .eq("member_id", session.memberId)
      .maybeSingle();

    if (memberError) {
      console.error("Recovery member lookup failed:", memberError.message);

      return NextResponse.json(
        { error: "Unable to verify member." },
        { status: 500, headers: { "Cache-Control": "no-store" } }
      );
    }

    if (!member || member.banned || !member.name?.trim()) {
      return NextResponse.json(
        { error: "Member account is unavailable." },
        { status: 403, headers: { "Cache-Control": "no-store" } }
      );
    }

    const { data: existing, error: lookupError } = await supabase
      .from("member_recovery")
      .select("recovery_code_encrypted")
      .eq("member_id", member.member_id)
      .maybeSingle();

    if (lookupError) {
      console.error("Recovery-code lookup failed:", lookupError.message);

      return NextResponse.json(
        { error: "Unable to load recovery code." },
        { status: 500, headers: { "Cache-Control": "no-store" } }
      );
    }

    if (existing) {
      const code = decryptRecoveryCode(existing.recovery_code_encrypted);

      const recoveryCodeHash = hashRecoveryCredentials(
        member.name,
        code
      );

      const { error: updateError } = await supabase
        .from("member_recovery")
        .update({
          recovery_code_hash: recoveryCodeHash,
          updated_at: new Date().toISOString(),
        })
        .eq("member_id", member.member_id);

      if (updateError) {
        console.error("Recovery hash refresh failed:", updateError.message);

        return NextResponse.json(
          { error: "Unable to verify recovery information." },
          { status: 500, headers: { "Cache-Control": "no-store" } }
        );
      }

      return NextResponse.json(
        { recoveryCode: code },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    const code = generateRecoveryCode();

    const { error: insertError } = await supabase
      .from("member_recovery")
      .insert({
        member_id: member.member_id,
        recovery_code_encrypted: encryptRecoveryCode(code),
        recovery_code_hash: hashRecoveryCredentials(member.name, code),
      });

    if (insertError) {
      console.error("Recovery-code creation failed:", insertError.message);

      return NextResponse.json(
        { error: "Unable to create recovery code. Please try again." },
        { status: 500, headers: { "Cache-Control": "no-store" } }
      );
    }

    return NextResponse.json(
      { recoveryCode: code },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Recovery-code request failed:", error);

    return NextResponse.json(
      { error: "Unable to load recovery code." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
