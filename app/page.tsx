import { createClient } from "@supabase/supabase-js";
import HomeClient from "./HomeClient";

export const dynamic = "force-dynamic";

export default async function Page() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const { count: photoCount } = await supabase
    .from("photos")
    .select("*", {
      count: "exact",
      head: true,
    });

  const { count: videoCount } = await supabase
    .from("videos")
    .select("*", {
      count: "exact",
      head: true,
    });

  const { data: recentPhotos } = await supabase
    .from("photos")
    .select("image_url")
    .order("id", { ascending: false })
    .limit(2);

  const { data: latestVideo } = await supabase
    .from("videos")
    .select("video_url, thumbnail_url")
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <HomeClient
      initialHomeData={{
        photoCount: photoCount ?? 0,
        videoCount: videoCount ?? 0,
        recentPhotos:
          recentPhotos?.map((photo) => photo.image_url) ?? [],
        latestVideo: latestVideo?.video_url ?? "",
        latestThumbnail: latestVideo?.thumbnail_url ?? "",
      }}
    />
  );
}