export interface Conversation {
  id: string;
  member_id: string;
  member_typing: boolean;
  admin_typing: boolean;
  created_at: string;
}

export interface AdminStatus {
  is_online: boolean;
  last_seen: string | null;
}

export interface Profile {
  profile_name: string;
  profile_photo: string | null;
}