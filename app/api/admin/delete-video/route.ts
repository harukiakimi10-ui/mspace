
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
  supabaseUrl: string,
  bucket: string
): string | null {
  try {
    const file = new URL(fileUrl);
    const base = new URL(supabaseUrl);

    if (file.origin !== base.origin) return null;

    const prefix =
      `/storage/v1/object/public/${bucket}/`;

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
    const videoId = body?.videoId;

    if (
      !(
        (typeof videoId === "number" &&
          Number.isFinite(videoId)) ||
        (typeof videoId === "string" &&
          videoId.trim().length > 0 &&
          videoId.length <= 200)
      )
    ) {
      return NextResponse.json(
        { error: "A valid video ID is required." },
        { status: 400 }
      );
    }

    const supabase = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data: video, error: lookupError } = await supabase
      .from("videos")
      .select("id, video_url, thumbnail_url")
      .eq("id", videoId)
      .maybeSingle();

    if (lookupError) {
      console.error("Video lookup failed:", lookupError.message);
      return NextResponse.json(
        { error: "Unable to find this video." },
        { status: 500 }
      );
    }

    if (!video) {
      return NextResponse.json(
        { error: "Video not found or already deleted." },
        { status: 404 }
      );
    }

    const videoPath = getStoragePath(
      video.video_url,
      url,
      "videos"
    );

    if (!videoPath) {
      return NextResponse.json(
        { error: "The video storage URL is invalid." },
        { status: 400 }
      );
    }

    const { error: videoStorageError } = await supabase.storage
      .from("videos")
      .remove([videoPath]);

    if (videoStorageError) {
      console.error(
        "Video storage deletion failed:",
        videoStorageError.message
      );
      return NextResponse.json(
        { error: "Unable to delete the video file." },
        { status: 500 }
      );
    }

    if (video.thumbnail_url) {
      const thumbnailPath = getStoragePath(
        video.thumbnail_url,
        url,
        "Thumbnails"
      );

      if (!thumbnailPath) {
        return NextResponse.json(
          { error: "The thumbnail storage URL is invalid." },
          { status: 400 }
        );
      }

      const { error: thumbnailError } = await supabase.storage
        .from("Thumbnails")
        .remove([thumbnailPath]);

      if (thumbnailError) {
        console.error(
          "Thumbnail deletion failed:",
          thumbnailError.message
        );
        return NextResponse.json(
          { error: "Video deleted, but its thumbnail could not be deleted." },
          { status: 500 }
        );
      }
    }

    const { error: databaseError } = await supabase
      .from("videos")
      .delete()
      .eq("id", video.id);

    if (databaseError) {
      console.error(
        "Video database deletion failed:",
        databaseError.message
      );
      return NextResponse.json(
        { error: "Video files deleted, but the database record could not be deleted." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin video deletion failed:", error);

    return NextResponse.json(
      { error: "Unable to delete this video." },
      { status: 500 }
    );
  }
}
