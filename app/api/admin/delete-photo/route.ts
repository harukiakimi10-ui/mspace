
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

function getStoragePath(
  fileUrl: string,
  supabaseUrl: string
): string | null {
  try {
    const file = new URL(fileUrl);
    const base = new URL(supabaseUrl);

    if (file.origin !== base.origin) return null;

    const prefix = "/storage/v1/object/public/photos/";

    if (!file.pathname.startsWith(prefix)) return null;

    const path = decodeURIComponent(
      file.pathname.slice(prefix.length)
    );

    return path || null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const secret = process.env.MSPACE_ADMIN_SESSION_SECRET;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SECRET_KEY;

    if (!secret || !url || !key) {
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
    const photoId = body?.photoId;

    if (
      !(
        (typeof photoId === "number" &&
          Number.isFinite(photoId)) ||
        (typeof photoId === "string" &&
          photoId.trim().length > 0 &&
          photoId.length <= 200)
      )
    ) {
      return NextResponse.json(
        { error: "A valid photo ID is required." },
        { status: 400 }
      );
    }

    const supabase = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data: photo, error: lookupError } = await supabase
      .from("photos")
      .select("id, image_url")
      .eq("id", photoId)
      .maybeSingle();

    if (lookupError) {
      console.error("Photo lookup failed:", lookupError.message);
      return NextResponse.json(
        { error: "Unable to find this photo." },
        { status: 500 }
      );
    }

    if (!photo) {
      return NextResponse.json(
        { error: "Photo not found or already deleted." },
        { status: 404 }
      );
    }

    const photoPath = getStoragePath(photo.image_url, url);

    if (!photoPath) {
      return NextResponse.json(
        { error: "The photo storage URL is invalid." },
        { status: 400 }
      );
    }

    const { error: storageError } = await supabase.storage
      .from("photos")
      .remove([photoPath]);

    if (storageError) {
      console.error("Photo storage deletion failed:", storageError.message);
      return NextResponse.json(
        { error: "Unable to delete the photo file." },
        { status: 500 }
      );
    }

    const { error: databaseError } = await supabase
      .from("photos")
      .delete()
      .eq("id", photo.id);

    if (databaseError) {
      console.error("Photo database deletion failed:", databaseError.message);
      return NextResponse.json(
        { error: "Photo file deleted, but its database record could not be deleted." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin photo deletion failed:", error);

    return NextResponse.json(
      { error: "Unable to delete this photo." },
      { status: 500 }
    );
  }
}
