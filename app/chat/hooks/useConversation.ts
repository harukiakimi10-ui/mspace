import { useState } from "react";
import {
  Conversation,
  Profile,
  AdminStatus,
} from "../types/conversation";

export function useConversation() {
  const [conversation, setConversation] =
    useState<Conversation | null>(null);

  const [conversationId, setConversationId] =
    useState<string | null>(null);

  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [admin, setAdmin] =
    useState<AdminStatus | null>(null);

  const [loading, setLoading] =
    useState(false);

  return {
    conversation,
    setConversation,

    conversationId,
    setConversationId,

    profile,
    setProfile,

    admin,
    setAdmin,

    loading,
    setLoading,
  };
}