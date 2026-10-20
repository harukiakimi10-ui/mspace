
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { createHmac } from "crypto";

export const runtime = "nodejs";

function signSession(value: string, secret: string) {
  return createHmac("sha256", secret)
    .update(value)
    .digest("hex");
}

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

const encodedPasswordHash =
  process.env.MSPACE_ADMIN_PASSWORD_HASH_B64;

const adminPasswordHash = encodedPasswordHash
  ? Buffer.from(encodedPasswordHash, "base64").toString("utf8")
  : undefined;

const sessionSecret =
  process.env.MSPACE_ADMIN_SESSION_SECRET;

    if (!adminPasswordHash || !sessionSecret) {
      return NextResponse.json(
        { error: "Admin login is not configured." },
        { status: 500 }
      );
    }

    if (
      typeof password !== "string" ||
      password.length > 200
    ) {
      return NextResponse.json(
        { error: "Invalid password." },
        { status: 400 }
      );
    }

    const valid = await bcrypt.compare(
      password,
      adminPasswordHash
    );

    if (!valid) {
      return NextResponse.json(
        { error: "Wrong password." },
        { status: 401 }
      );
    }

    const SESSION_LIFETIME = 30 * 24 * 60 * 60;
    const expires = Math.floor(Date.now() / 1000) + SESSION_LIFETIME;
    const payload = `admin:${expires}`;
    const signature = signSession(payload, sessionSecret);
    const token = `${payload}:${signature}`;

    const cookieStore = await cookies();

    cookieStore.set("mspace_admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: SESSION_LIFETIME,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Unable to log in." },
      { status: 500 }
    );
  }
}
