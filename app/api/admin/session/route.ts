
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

export const runtime = "nodejs";

const SESSION_LIFETIME = 30 * 24 * 60 * 60;

function signSession(payload: string, secret: string) {
  return createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
}

export async function GET() {
  const secret = process.env.MSPACE_ADMIN_SESSION_SECRET;

  if (!secret) {
    return NextResponse.json(
      { authenticated: false },
      { status: 500 }
    );
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("mspace_admin_session")?.value;

  if (!token) {
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    );
  }

  const parts = token.split(":");

  if (parts.length !== 3) {
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    );
  }

  const [identity, expiresText, signature] = parts;

  if (
    identity !== "admin" ||
    !/^\d+$/.test(expiresText) ||
    !/^[a-f0-9]{64}$/.test(signature)
  ) {
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    );
  }

  const payload = `${identity}:${expiresText}`;
  const expectedSignature = signSession(payload, secret);
  const supplied = Buffer.from(signature, "hex");
  const expected = Buffer.from(expectedSignature, "hex");

  if (
    supplied.length !== expected.length ||
    !timingSafeEqual(supplied, expected) ||
    Number(expiresText) <= Math.floor(Date.now() / 1000)
  ) {
    cookieStore.set("mspace_admin_session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });

    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    );
  }

  // Renew both the signed expiration and browser cookie.
  const expires = Math.floor(Date.now() / 1000) + SESSION_LIFETIME;
  const renewedPayload = `${identity}:${expires}`;
  const renewedSignature = signSession(renewedPayload, secret);
  const renewedToken = `${renewedPayload}:${renewedSignature}`;

  cookieStore.set("mspace_admin_session", renewedToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_LIFETIME,
  });

  return NextResponse.json(
    { authenticated: true },
    { headers: { "Cache-Control": "no-store" } }
  );
}
