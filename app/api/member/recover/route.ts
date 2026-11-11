import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import { isIP } from "node:net";

import {
  createMemberSession,
  MEMBER_SESSION_COOKIE,
} from "@/lib/server/memberSession";

import {
  hashRecoveryCredentials,
  hashRecoveryAttemptBucket,
  normalizeRecoveryName,
  verifyRecoveryHash,
} from "@/lib/server/memberRecovery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function response(
  body: Record<string, unknown>,
  status = 200
) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name =
      typeof body?.name === "string" ? body.name.trim() : "";

    const code =
      typeof body?.code === "string" ? body.code.trim() : "";

    let deviceId =
      typeof body?.deviceId === "string"
        ? body.deviceId.trim()
        : "";

    if (
      !name ||
      name.length > 200 ||
      !/^\d{4}$/.test(code) ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(deviceId)
    ) {
      return response(
        { error: "Enter your registered name, recovery code and device information." },
        400
      );
    }

    const normalizedName = normalizeRecoveryName(name);

    if (!normalizedName) {
      return response(
        { error: "Invalid recovery information." },
        400
      );
    }

    // Vercel supplies the client IP in x-real-ip.
    const forwardedIp = request.headers.get("x-real-ip")?.trim() || "";

const ip =
  forwardedIp ||
  (process.env.NODE_ENV !== "production" ? "127.0.0.1" : "");

    if (!ip || isIP(ip) === 0) {
      return response(
        { error: "Unable to verify this connection. Please try again." },
        400
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseSecret = process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !supabaseSecret) {
      return response(
        { error: "Server configuration is incomplete." },
        500
      );
    }

    const supabase = createClient(
      supabaseUrl,
      supabaseSecret,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const credentialBucket = hashRecoveryAttemptBucket(
      `credential:${ip}:${normalizedName}`
    );

    const ipBucket = hashRecoveryAttemptBucket(`ip:${ip}`);

    // Check both lockout buckets before processing credentials.
    const [credentialLock, ipLock] = await Promise.all([
      supabase.rpc("check_member_recovery_lock", {
        p_bucket_hash: credentialBucket,
      }),
      supabase.rpc("check_member_recovery_lock", {
        p_bucket_hash: ipBucket,
      }),
    ]);

    if (credentialLock.error || ipLock.error) {
      console.error(
        "Recovery lock check failed:",
        credentialLock.error?.message || ipLock.error?.message
      );

      return response(
        { error: "Unable to verify recovery request." },
        500
      );
    }

    const credentialLocked =
      credentialLock.data?.some(
        (item: { is_locked: boolean }) => item.is_locked
      ) ?? false;

    const ipLocked =
      ipLock.data?.some(
        (item: { is_locked: boolean }) => item.is_locked
      ) ?? false;

    if (credentialLocked || ipLocked) {
      return response(
        { error: "Too many failed attempts. Please try again later." },
        429
      );
    }

    const suppliedHash = hashRecoveryCredentials(name, code);

    const { data: recoveryRecords, error: recoveryError } =
      await supabase
        .from("member_recovery")
        .select("member_id, recovery_code_hash")
        .eq("recovery_code_hash", suppliedHash)
        .limit(2);

    if (recoveryError) {
      console.error(
        "Recovery credential lookup failed:",
        recoveryError.message
      );

      return response(
        { error: "Unable to verify recovery information." },
        500
      );
    }

    const matchedRecord =
      recoveryRecords?.length === 1 &&
      verifyRecoveryHash(
        recoveryRecords[0].recovery_code_hash,
        name,
        code
      )
        ? recoveryRecords[0]
        : null;

    if (!matchedRecord) {
      const [credentialFailure, ipFailure] = await Promise.all([
        supabase.rpc("record_member_recovery_failure", {
          p_bucket_hash: credentialBucket,
          p_max_attempts: 5,
          p_window_seconds: 900,
        }),
        supabase.rpc("record_member_recovery_failure", {
          p_bucket_hash: ipBucket,
          p_max_attempts: 20,
          p_window_seconds: 3600,
        }),
      ]);

      if (credentialFailure.error || ipFailure.error) {
        console.error(
          "Recovery failure recording failed:",
          credentialFailure.error?.message ||
            ipFailure.error?.message
        );

        return response(
          { error: "Unable to process recovery request." },
          500
        );
      }

      return response(
        { error: "The registered name or recovery code is incorrect." },
        401
      );
    }

    const { data: member, error: memberError } = await supabase
      .from("members")
      .select("member_id, name, banned")
      .eq("member_id", matchedRecord.member_id)
      .maybeSingle();

    if (memberError) {
      console.error(
        "Recovered member lookup failed:",
        memberError.message
      );

      return response(
        { error: "Unable to verify member account." },
        500
      );
    }

    if (!member || member.banned) {
      return response(
        { error: "This member account is unavailable." },
        403
      );
    }

    // Reject devices that have previously been banned.
    const { data: bannedDevice, error: bannedDeviceError } =
      await supabase
        .from("banned_devices")
        .select("id")
        .eq("device_id", deviceId)
        .limit(1)
        .maybeSingle();

    if (bannedDeviceError) {
      console.error(
        "Recovery device-ban check failed:",
        bannedDeviceError.message
      );

      return response(
        { error: "Unable to verify this device." },
        500
      );
    }

    if (bannedDevice) {
      return response(
        { error: "This device is blocked from accessing MSpace." },
        403
      );
    }

    // Never take a device ID away from another member.
    const { data: deviceOwner, error: deviceOwnerError } =
      await supabase
        .from("members")
        .select("member_id")
        .eq("device_id", deviceId)
        .maybeSingle();

    if (deviceOwnerError) {
      console.error(
        "Recovery device ownership check failed:",
        deviceOwnerError.message
      );

      return response(
        { error: "Unable to verify this device." },
        500
      );
    }

    if (
      deviceOwner &&
      deviceOwner.member_id !== member.member_id
    ) {
      deviceId = randomUUID();
    }

    // Create the session before changing the device association.
    const session = createMemberSession(member.member_id);

    const { error: updateError } = await supabase
      .from("members")
      .update({ device_id: deviceId })
      .eq("member_id", member.member_id);

    if (updateError) {
      console.error(
        "Recovered device association failed:",
        updateError.message
      );

      return response(
        { error: "Unable to restore this account." },
        500
      );
    }

    const result = response({
      authenticated: true,
      memberId: member.member_id,
      deviceId,
    });

    result.cookies.set(
      MEMBER_SESSION_COOKIE,
      session.token,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: session.maxAge,
      }
    );

    return result;
  } catch (error) {
    console.error("Member account recovery failed:", error);

    return response(
      { error: "Unable to complete account recovery." },
      500
    );
  }
}
