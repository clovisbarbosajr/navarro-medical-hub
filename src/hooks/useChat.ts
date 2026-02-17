import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useChatAuth } from "@/contexts/ChatAuthContext";

export interface Profile {
  user_id: string;
  display_name: string;
  department: string;
  avatar_url: string | null;
  is_online: boolean;
}

export interface Conversation {
  id: string;
  type: "direct" | "group";
  name: string | null;
  created_at: string;
  participants: { user_id: string; display_name: string; avatar_url: string | null; is_online: boolean }[];
  last_message?: { content: string | null; created_at: string; sender_id: string };
  unread_count: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string | null;
  file_url: string | null;
  file_name: string | null;
  file_type: string | null;
  created_at: string;
  read_at: string | null;
  sender?: Profile;
}

export const useChat = () => {
  const { user } = useChatAuth();
  const [contacts, setContacts] = useState<Profile[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContacts = useCallback(async () => {
    if (!user) return;
    const { data } = await (supabase as any)
      .from("user_profiles")
      .select("user_id, display_name, department, avatar_url, is_online")
      .neq("user_id", user.id)
      .order("display_name");
    if (data) setContacts(data);
  }, [user]);

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    const { data: participantData } = await (supabase as any)
      .from("chat_participants").select("conversation_id").eq("user_id", user.id);
    if (!participantData?.length) { setConversations([]); setLoading(false); return; }
    const conversationIds = participantData.map((p: any) => p.conversation_id);
    const { data: convData } = await (supabase as any)
      .from("chat_conversations").select("id, type, name, created_at").in("id", conversationIds).order("updated_at", { ascending: false });
    if (!convData) { setLoading(false); return; }
    const [participantsRes, messagesRes, unreadRes] = await Promise.all([
      (supabase as any).from("chat_participants").select("conversation_id, user_id").in("conversation_id", conversationIds),
      (supabase as any).from("chat_messages").select("conversation_id, content, created_at, sender_id").in("conversation_id", conversationIds).order("created_at", { ascending: false }),
      (supabase as any).from("chat_messages").select("conversation_id").in("conversation_id", conversationIds).neq("sender_id", user.id).is("read_at", null),
    ]);
    const allUserIds = [...new Set(participantsRes.data?.map((p: any) => p.user_id) || [])] as string[];
    const { data: allProfiles } = await (supabase as any).from("user_profiles").select("user_id, display_name, avatar_url, is_online").in("user_id", allUserIds);
    const profileMap = new Map(allProfiles?.map((p: any) => [p.user_id, p]) || []);
    const lastMsgMap = new Map<string, { content: string | null; created_at: string; sender_id: string }>();
    messagesRes.data?.forEach((m: any) => { if (!lastMsgMap.has(m.conversation_id)) lastMsgMap.set(m.conversation_id, { content: m.content, created_at: m.created_at, sender_id: m.sender_id }); });
    const unreadMap = new Map<string, number>();
    unreadRes.data?.forEach((m: any) => { unreadMap.set(m.conversation_id, (unreadMap.get(m.conversation_id) || 0) + 1); });
    const partsMap = new Map<string, string[]>();
    participantsRes.data?.forEach((p: any) => { const arr = partsMap.get(p.conversation_id) || []; arr.push(p.user_id); partsMap.set(p.conversation_id, arr); });
    const enriched: Conversation[] = convData.map((conv: any) => {
      const partUserIds = partsMap.get(conv.id) || [];
      const participants = partUserIds.map((uid: string) => profileMap.get(uid)).filter(Boolean) as Conversation["participants"];
      return { ...conv, type: conv.type as "direct" | "group", participants, last_message: lastMsgMap.get(conv.id), unread_count: unreadMap.get(conv.id) || 0 };
    });
    setConversations(enriched);
    setLoading(false);
  }, [user]);

  const fetchMessages = useCallback(async (conversationId: string, limit = 30, before?: string): Promise<Message[]> => {
    let query = (supabase as any).from("chat_messages").select("*").eq("conversation_id", conversationId).order("created_at", { ascending: false }).limit(limit);
    if (before) query = query.lt("created_at", before);
    const { data } = await query;
    if (!data) return [];
    const senderIds = [...new Set(data.map((m: any) => m.sender_id))] as string[];
    const { data: profiles } = await (supabase as any).from("user_profiles").select("user_id, display_name, department, avatar_url, is_online").in("user_id", senderIds);
    const profileMap = new Map(profiles?.map((p: any) => [p.user_id, p]));
    return data.map((m: any) => ({ ...m, sender: profileMap.get(m.sender_id) })).reverse();
  }, []);

  const sendMessage = useCallback(async (conversationId: string, content: string, fileUrl?: string, fileName?: string, fileType?: string) => {
    if (!user) return;
    await (supabase as any).from("chat_messages").insert({ conversation_id: conversationId, sender_id: user.id, content: content || null, file_url: fileUrl || null, file_name: fileName || null, file_type: fileType || null });
    await (supabase as any).from("chat_conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversationId);
  }, [user]);

  const markAsRead = useCallback(async (conversationId: string) => {
    if (!user) return;
    await (supabase as any).from("chat_messages").update({ read_at: new Date().toISOString() }).eq("conversation_id", conversationId).neq("sender_id", user.id).is("read_at", null);
  }, [user]);

  const startDirectConversation = useCallback(async (otherUserId: string): Promise<string> => {
    if (!user) throw new Error("Not authenticated");
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-manage`, {
      method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ action: "start_direct", otherUserId }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Failed to create conversation");
    await fetchConversations();
    return result.conversationId;
  }, [user, fetchConversations]);

  const createGroupConversation = useCallback(async (name: string, memberIds: string[]): Promise<string> => {
    if (!user) throw new Error("Not authenticated");
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-manage`, {
      method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ action: "create_group", name, memberIds }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Failed to create group");
    await fetchConversations();
    return result.conversationId;
  }, [user, fetchConversations]);

  useEffect(() => { if (user) { fetchContacts(); fetchConversations(); } }, [user, fetchContacts, fetchConversations]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel("chat-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, () => { fetchConversations(); })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "user_profiles" }, () => { fetchContacts(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, fetchConversations, fetchContacts]);

  return { contacts, conversations, loading, fetchMessages, sendMessage, markAsRead, startDirectConversation, createGroupConversation, refreshConversations: fetchConversations };
};
