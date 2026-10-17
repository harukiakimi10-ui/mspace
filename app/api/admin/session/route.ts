
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

export const runtime = "nodejs";

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

if (!/^[a-f0-9]{64}$/.test(signature)) {
  return NextResponse.json(
    { authenticated: false },
    { status: 401 }
  );
}

const payload = `${identity}:${expiresText}`;

  const expectedSignature = createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  const supplied = Buffer.from(signature, "hex");
  const expected = Buffer.from(expectedSignature, "hex");

  if (
    identity !== "admin" ||
    !/^\d+$/.test(expiresText) ||
    supplied.length !== expected.length ||
    !timingSafeEqual(supplied, expected) ||
    Number(expiresText) <= Math.floor(Date.now() / 1000)
  ) {
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    );
  }

  return NextResponse.json({ authenticated: true });
}
