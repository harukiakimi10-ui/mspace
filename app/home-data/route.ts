import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );

    // Photo count
    const { count: photoCount, error: photoCountError } =
      await supabase
        .from("photos")
        .select("*", {
          count: "exact",
          head: true,
        });

    if (photoCountError) {
      console.error("Photo count error:", photoCountError);
    }

    // Video count
    const { count: videoCount, error: videoCountError } =
      await supabase
        .from("videos")
        .select("*", {
          count: "exact",
          head: true,
        });

    if (videoCountError) {
      console.error("Video count error:", videoCountError);
    }

    // Recent photos
    const { data: recentPhotos, error: recentPhotosError } =
      await supabase
        .from("photos")
        .select("image_url")
        .order("id", { ascending: false })
        .limit(2);

    if (recentPhotosError) {
      console.error("Recent photos error:", recentPhotosError);
    }

    // Latest video
    const { data: latestVideo, error: latestVideoError } =
      await supabase
        .from("videos")
        .select("video_url, thumbnail_url")
        .order("id", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (latestVideoError) {
      console.error("Latest video error:", latestVideoError);
    }

    return NextResponse.json({
      photoCount: photoCount ?? 0,
      videoCount: videoCount ?? 0,

      recentPhotos:
        recentPhotos?.map((photo) => photo.image_url) ?? [],

      latestVideo: latestVideo?.video_url ?? "",
      latestThumbnail: latestVideo?.thumbnail_url ?? "",
    });
  } catch (error) {
    console.error("Home data API error:", error);

    return NextResponse.json(
      {
        photoCount: 0,
        videoCount: 0,
        recentPhotos: [],
        latestVideo: "",
        latestThumbnail: "",
      },
      { status: 500 }
    );
  }
}1