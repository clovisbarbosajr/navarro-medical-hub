import { useState, useCallback, useEffect, useRef } from "react";
import { MessageCircle, Minus, Settings } from "lucide-react";
import chatLogo from "@/assets/chat-logo.png";
import { useChat } from "@/hooks/useChat";
import { useChatAuth } from "@/contexts/ChatAuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useNotificationSound } from "@/hooks/useNotificationSound";
import { supabase } from "@/integrations/supabase/client";
import ChatContactsList from "./ChatContactsList";
import ChatConversationArea from "./ChatConversationArea";
import CreateGroupDialog from "@/components/chat/CreateGroupDialog";

const ChatWidget = ({ onClose }: { onClose?: () => void }) => {
  const { user, profile, refreshProfile } = useChatAuth();
  const { isAdmin } = useUserRole();
  const { playBeep, playAttention } = useNotificationSound();
  const { contacts, conversations, fetchMessages, sendMessage, markAsRead, startDirectConversation, createGroupConversation } = useChat();

  const [activeTab, setActiveTab] = useState<string>();
  const [minimized, setMinimized] = useState(false);
  const [showGroupDialog, setShowGroupDialog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [attentionConvIds, setAttentionConvIds] = useState<Set<string>>(new Set());
  const prevUnreadRef = useRef(0);

  useEffect(() => {
    if (user) { supabase.from("user_profiles").select("sound_enabled").eq("user_id", user.id).maybeSingle().then(({ data }) => { if (data) setSoundEnabled(data.sound_enabled); }); }
  }, [user]);

  const toggleSound = async () => {
    const newVal = !soundEnabled; setSoundEnabled(newVal);
    if (user) await supabase.from("user_profiles").update({ sound_enabled: newVal }).eq("user_id", user.id);
  };

  const openConversation = useCallback((id: string) => {
    setActiveTab(id); setMinimized(false);
    setAttentionConvIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
  }, []);

  const handleStartDirect = useCallback(async (userId: string) => {
    try { const convId = await startDirectConversation(userId); if (convId) openConversation(convId); } catch (err) { console.error("Failed to start conversation:", err); }
  }, [startDirectConversation, openConversation]);

  const handleCreateGroup = useCallback(async (name: string, memberIds: string[]) => {
    const convId = await createGroupConversation(name, memberIds); openConversation(convId);
  }, [createGroupConversation, openConversation]);

  const getConversationName = (id: string) => {
    const conv = conversations.find((c) => c.id === id);
    if (!conv) return "...";
    if (conv.type === "group") return conv.name || "Grupo";
    const other = conv.participants.find((p) => p.user_id !== user?.id);
    return other?.display_name || "Conversa";
  };

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread_count, 0);
  const hasAnyAttention = attentionConvIds.size > 0;

  useEffect(() => {
    if (totalUnread > prevUnreadRef.current && soundEnabled) playBeep();
    prevUnreadRef.current = totalUnread;
    document.title = totalUnread > 0 ? `(${totalUnread}) Navarro Connect` : "Navarro Medical - Intranet";
  }, [totalUnread, soundEnabled, playBeep]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel("attention-requests")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, (payload: any) => {
        if (payload.new?.is_attention && payload.new?.sender_id !== user.id) {
          const convId = payload.new.conversation_id;
          setAttentionConvIds((prev) => new Set(prev).add(convId));
          setShaking(true);
          if (soundEnabled) playAttention();
          setTimeout(() => setShaking(false), 1300);
        }
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, soundEnabled, playAttention]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const filePath = `${user.id}/avatar_${Date.now()}.${file.name.split('.').pop()}`;
    const { error } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true });
    if (!error) {
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
      await supabase.from("user_profiles").update({ avatar_url: urlData.publicUrl }).eq("user_id", user.id);
      await refreshProfile();
    }
    e.target.value = "";
  };

  if (minimized) {
    return (
      <button onClick={() => setMinimized(false)} style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem' }}
        className={`z-50 w-16 h-16 rounded-full shadow-lg hover:scale-105 transition-transform flex items-center justify-center relative overflow-hidden p-0 border-0 bg-transparent ${hasAnyAttention ? "mini-pulse-attention" : totalUnread > 0 ? "mini-pulse" : ""}`}>
        <img src={chatLogo} alt="Chat" className="w-full h-full object-cover" />
        {totalUnread > 0 && (
          <span className={`absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full text-[10px] flex items-center justify-center font-bold ${hasAnyAttention ? "bg-destructive text-destructive-foreground" : "bg-green-500 text-white"}`}>{totalUnread > 9 ? "9+" : totalUnread}</span>
        )}
      </button>
    );
  }

  return (
    <>
      <div style={{ position: 'fixed', bottom: '1rem', right: '1rem' }} className={`z-50 w-[420px] h-[600px] max-h-[80vh] max-w-[calc(100vw-2rem)] flex flex-col glass-strong rounded-2xl shadow-2xl overflow-hidden animate-in border border-border/30 ${shaking ? "msn-shake" : ""}`}>
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/30 bg-secondary/30">
          <div className="flex items-center gap-2">
            {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="w-6 h-6 rounded-full object-cover" /> : <MessageCircle className="w-4 h-4 text-primary" />}
            <span className="text-sm font-display font-semibold text-foreground">{profile?.display_name || "Navarro Connect"}</span>
            {totalUnread > 0 && <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">{totalUnread}</span>}
          </div>
        <div className="flex items-center gap-1">
            <button onClick={() => setShowSettings(!showSettings)} className="p-1.5 rounded-md hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"><Settings className="w-4 h-4" /></button>
            <button onClick={() => setMinimized(true)} className="p-1.5 rounded-md hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"><Minus className="w-4 h-4" /></button>
          </div>
        </div>
        {showSettings && (
          <div className="px-3 py-2 border-b border-border/30 bg-secondary/20 space-y-2 animate-in">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-foreground">🔔 Som de notificação</span>
              <button onClick={toggleSound} className={`w-8 h-4 rounded-full transition-colors relative ${soundEnabled ? "bg-primary" : "bg-muted"}`}>
                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-foreground transition-transform`} style={{ left: soundEnabled ? "calc(100% - 14px)" : "2px" }} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-foreground">📷 Foto do perfil</span>
              <label className="text-[10px] text-primary cursor-pointer hover:underline"><input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />Alterar</label>
            </div>
            {profile?.avatar_url && <img src={profile.avatar_url} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />}
          </div>
        )}
        <div className="flex-1 flex min-h-0">
          <ChatContactsList contacts={contacts} conversations={conversations} activeConversationId={activeTab} onSelectConversation={openConversation} onStartDirect={handleStartDirect} onCreateGroup={() => setShowGroupDialog(true)} onCloseConversation={() => setActiveTab(undefined)} isAdmin={isAdmin} />
          <div className="flex-1 flex flex-col min-w-0">
            {activeTab ? (
              <ChatConversationArea key={activeTab} conversationId={activeTab} conversationName={getConversationName(activeTab)} fetchMessages={fetchMessages} sendMessage={sendMessage} markAsRead={markAsRead} onBack={() => setActiveTab(undefined)} />
            ) : (
              <div className="flex-1 flex items-center justify-center p-4"><div className="text-center space-y-2"><MessageCircle className="w-8 h-8 text-primary/40 mx-auto" /><p className="text-xs text-muted-foreground">Selecione um contato</p></div></div>
            )}
          </div>
        </div>
      </div>
      {showGroupDialog && <CreateGroupDialog contacts={contacts} onClose={() => setShowGroupDialog(false)} onCreate={handleCreateGroup} />}
    </>
  );
};

export default ChatWidget;
