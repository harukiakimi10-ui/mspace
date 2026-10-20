
import "server-only";

import {
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "crypto";

export const MEMBER_SESSION_COOKIE = "mspace_member_session";

const SESSION_LIFETIME = 365 * 24 * 60 * 60;

type MemberSessionPayload = {
  memberId: string;
  sessionId: string;
  expiresAt: number;
};

function getSessionSecret(): string {
  const secret = process.env.MSPACE_MEMBER_SESSION_SECRET;

  if (!secret || secret.length < 64) {
    throw new Error(
      "Member session secret is missing or invalid."
    );
  }

  return secret;
}

function sign(value: string, secret: string): string {
  return createHmac("sha256", secret)
    .update(value)
    .digest("hex");
}

export function createMemberSession(memberId: string) {
  if (!memberId || memberId.length > 200) {
    throw new Error("Invalid member ID.");
  }

  const secret = getSessionSecret();
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_LIFETIME;

  const payload: MemberSessionPayload = {
    memberId,
    sessionId: randomBytes(32).toString("hex"),
    expiresAt,
  };

  const encodedPayload = Buffer.from(
    JSON.stringify(payload)
  ).toString("base64url");

  const signature = sign(encodedPayload, secret);

  return {
    token: `${encodedPayload}.${signature}`,
    maxAge: SESSION_LIFETIME,
  };
}

export function verifyMemberSession(token: string): MemberSessionPayload | null {
  try {
    const parts = token.split(".");

    if (parts.length !== 2) return null;

    const [encodedPayload, suppliedSignature] = parts;

    if (!/^[a-f0-9]{64}$/.test(suppliedSignature)) {
      return null;
    }

    const expectedSignature = sign(
      encodedPayload,
      getSessionSecret()
    );

    const supplied = Buffer.from(suppliedSignature, "hex");
    const expected = Buffer.from(expectedSignature, "hex");

    if (
      supplied.length !== expected.length ||
      !timingSafeEqual(supplied, expected)
    ) {
      return null;
    }

    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8")
    ) as MemberSessionPayload;

    if (
      typeof payload.memberId !== "string" ||
      !payload.memberId ||
      typeof payload.sessionId !== "string" ||
      !/^[a-f0-9]{64}$/.test(payload.sessionId) ||
      typeof payload.expiresAt !== "number" ||
      payload.expiresAt <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
