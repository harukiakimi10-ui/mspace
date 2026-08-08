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
  const { error } = await supabase
    .from("members")
    .update({
      is_online: online,
      last_seen: new Date().toISOString(),
    })
    .eq("member_id", memberId);

  if (error) throw error;
}