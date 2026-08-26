import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export async function getConversation(memberId: string) {
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("member_id", memberId)
    .order("created_at", { ascending: true })
    .limit(1);

  if (error) throw error;

  return data?.[0] ?? null;
}

export async function createConversation(memberId: string) {
  const { data, error } = await supabase
    .from("conversations")
    .insert({
      member_id: memberId,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function getProfile() {
  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (error) throw error;

  return data;
}

export async function getProfileSettings() {
  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (error) throw error;

  return data;
}

export async function getAdminStatus() {
  const { data, error } = await supabase
    .from("admins")
    .select("is_online,last_seen")
    .single();

  if (error) throw error;

  return data;
}

export async function updateOnlineStatus(
  memberId: string,
  online: boolean
) {
  if (!memberId) {
    console.error("ONLINE STATUS: memberId is missing");
    return;
  }

  const now = new Date().toISOString();

  console.log("ONLINE STATUS UPDATE:", {
    memberId,
    online,
    now,
  });

  try {
    const { data, error } = await supabase
  .from("members")
  .update(
    online
      ? {
          is_online: true,
          online_at: now,
        }
      : {
          is_online: false,
          online_at: null,
          last_seen: now,
        }
  )
  .eq("member_id", memberId)
  .select("member_id,is_online,online_at,last_seen");

    if (error) {
      console.error("ONLINE STATUS SUPABASE ERROR:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });

      return;
    }

    console.log(
  "ONLINE STATUS UPDATE SUCCESS:",
  {
    memberId,
    online,
  }
);
  } catch (error: any) {
    console.error(
      "ONLINE STATUS NETWORK ERROR:",
      {
        message: error?.message,
        name: error?.name,
        stack: error?.stack,
        error,
      }
    );
  }
}