import { useState, useEffect, useRef, useCallback } from "react";
import { Send, Paperclip, Smile, Trash2, Download, FileText, AlertTriangle, Play, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useChatAuth } from "@/contexts/ChatAuthContext";
import type { Message } from "@/hooks/useChat";
import FilePreviewModal from "./FilePreviewModal";
import MessageReactions from "./MessageReactions";

const BASIC_EMOJIS = ["😀", "😂", "😍", "👍", "👎", "❤️", "🔥", "😢", "😮", "🎉", "✅", "🙏"];

interface Props {
  conversationId: string;
  conversationName: string;
  fetchMessages: (id: string, limit?: number, before?: string) => Promise<Message[]>;
  sendMessage: (id: string, content: string, fileUrl?: string, fileName?: string, fileType?: string) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  onBack?: () => void;
}

const ChatConversationArea = ({ conversationId, conversationName, fetchMessages, sendMessage, markAsRead, onBack }: Props) => {
  const { user, profile } = useChatAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<Record<string, "downloading" | "done">>({});
  const [previewFile, setPreviewFile] = useState<{ url: string; name: string; type: string | null } | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());
  const scrollRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);
  const typingTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const lastTypingSentRef = useRef(0);
  const typingChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const PAGE_SIZE = 30;

  const loadMessages = useCallback(async () => {
    const msgs = await fetchMessages(conversationId, PAGE_SIZE);
    setMessages(msgs);
    setHasMore(msgs.length >= PAGE_SIZE);
    isInitialLoad.current = true;
    markAsRead(conversationId);
  }, [conversationId, fetchMessages, markAsRead]);

  useEffect(() => { loadMessages(); }, [loadMessages]);

  useEffect(() => {
    if (isInitialLoad.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      isInitialLoad.current = false;
    }
  }, [messages]);

  const handleScroll = useCallback(async () => {
    const el = scrollRef.current;
    if (!el || !hasMore || loadingOlder) return;
    if (el.scrollTop < 60 && messages.length > 0) {
      setLoadingOlder(true);
      const oldestMsg = messages[0];
      const olderMsgs = await fetchMessages(conversationId, PAGE_SIZE, oldestMsg.created_at);
      if (olderMsgs.length < PAGE_SIZE) setHasMore(false);
      if (olderMsgs.length > 0) {
        const prevHeight = el.scrollHeight;
        setMessages((prev) => [...olderMsgs, ...prev]);
        requestAnimationFrame(() => { el.scrollTop = el.scrollHeight - prevHeight; });
      }
      setLoadingOlder(false);
    }
  }, [hasMore, loadingOlder, messages, conversationId, fetchMessages]);

  useEffect(() => {
    const channel = supabase
      .channel(`widget-msgs-${conversationId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `conversation_id=eq.${conversationId}` }, async (payload: any) => {
        const newMsg = payload.new;
        const { data: senderProfile } = await (supabase as any).from("user_profiles").select("user_id, display_name, department, avatar_url, is_online").eq("user_id", newMsg.sender_id).maybeSingle();
        setMessages((prev) => [...prev, { ...newMsg, sender: senderProfile || undefined }]);
        markAsRead(conversationId);
        requestAnimationFrame(() => { scrollRef.current?.scrollTo({ top: scrollRef.current!.scrollHeight, behavior: "smooth" }); });
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "chat_messages", filter: `conversation_id=eq.${conversationId}` }, (payload: any) => {
        const updated = payload.new;
        setMessages((prev) => prev.map((m) => m.id === updated.id ? { ...m, read_at: updated.read_at } : m));
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "chat_messages", filter: `conversation_id=eq.${conversationId}` }, (payload: any) => {
        setMessages((prev) => prev.filter((m) => m.id !== payload.old.id));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [conversationId, markAsRead]);

  // Typing indicator
  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel(`typing-${conversationId}`);
    typingChannelRef.current = channel;
    channel.on("broadcast", { event: "typing" }, (payload: any) => {
      const { userId, displayName } = payload.payload;
      if (userId === user.id) return;
      setTypingUsers((prev) => new Map(prev).set(userId, displayName));
      const existing = typingTimeoutRef.current.get(userId);
      if (existing) clearTimeout(existing);
      const timeout = setTimeout(() => {
        setTypingUsers((prev) => { const next = new Map(prev); next.delete(userId); return next; });
        typingTimeoutRef.current.delete(userId);
      }, 3000);
      typingTimeoutRef.current.set(userId, timeout);
    });
    channel.subscribe();
    return () => { supabase.removeChannel(channel); typingChannelRef.current = null; typingTimeoutRef.current.forEach((t) => clearTimeout(t)); typingTimeoutRef.current.clear(); };
  }, [conversationId, user]);

  const emitTyping = useCallback(() => {
    if (!user || !typingChannelRef.current) return;
    const now = Date.now();
    if (now - lastTypingSentRef.current < 2000) return;
    lastTypingSentRef.current = now;
    typingChannelRef.current.send({ type: "broadcast", event: "typing", payload: { userId: user.id, displayName: profile?.display_name || "Alguém" } });
  }, [user, profile]);

  const handleSend = async () => { const text = input.trim(); if (!text) return; setInput(""); setShowEmojis(false); await sendMessage(conversationId, text); };
  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 10 * 1024 * 1024) { alert("Limite: 10MB"); return; }
    setUploading(true);
    const filePath = `${user.id}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from("chat-files").upload(filePath, file);
    if (!error) {
      const { data: urlData } = supabase.storage.from("chat-files").getPublicUrl(filePath);
      await sendMessage(conversationId, "", urlData.publicUrl, file.name, file.type);
    }
    setUploading(false);
    e.target.value = "";
  };

  const handleDelete = async (msgId: string) => { await (supabase as any).from("chat_messages").delete().eq("id", msgId); setMessages((prev) => prev.filter((m) => m.id !== msgId)); };

  const [attentionCount, setAttentionCount] = useState(0);
  const [attentionCooldown, setAttentionCooldown] = useState(false);

  const handleAttentionRequest = async () => {
    if (!user || attentionCooldown) return;
    await (supabase as any).from("chat_messages").insert({ conversation_id: conversationId, sender_id: user.id, content: "⚠️ Pedido de atenção!", is_attention: true });
    await (supabase as any).from("chat_conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversationId);
    const newCount = attentionCount + 1;
    setAttentionCount(newCount);
    if (newCount >= 2) {
      setAttentionCooldown(true);
      setTimeout(() => { setAttentionCount(0); setAttentionCooldown(false); }, 5 * 60 * 1000);
    }
  };

  const handleDownload = async (url: string, name: string, msgId: string) => {
    setDownloadStatus((prev) => ({ ...prev, [msgId]: "downloading" }));
    try {
      const res = await fetch(url); const blob = await res.blob();
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; a.click(); URL.revokeObjectURL(a.href);
      setDownloadStatus((prev) => ({ ...prev, [msgId]: "done" }));
      setTimeout(() => setDownloadStatus((prev) => { const n = { ...prev }; delete n[msgId]; return n; }), 3000);
    } catch { setDownloadStatus((prev) => { const n = { ...prev }; delete n[msgId]; return n; }); }
  };

  const formatTime = (date: string) => new Date(date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const initials = (name: string) => name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  const isImage = (type: string | null) => type?.startsWith("image/");
  const isVideo = (type: string | null) => type?.startsWith("video/");
  const canDelete = (msg: Message) => {
    if (msg.sender_id !== user?.id) return false;
    const msgDate = new Date(msg.created_at);
    const fiveMinAgo = new Date(); fiveMinAgo.setMinutes(fiveMinAgo.getMinutes() - 5);
    return msgDate > fiveMinAgo;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-3 py-2 border-b border-border/30 bg-secondary/20 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {onBack && <button onClick={onBack} className="p-1 rounded hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft className="w-3.5 h-3.5" /></button>}
          <span className="text-xs font-medium text-foreground">{conversationName}</span>
        </div>
        <button onClick={handleAttentionRequest} disabled={attentionCooldown} className={`p-1 rounded hover:bg-accent/20 text-muted-foreground hover:text-accent transition-colors ${attentionCooldown ? "opacity-30 cursor-not-allowed" : ""}`} title={attentionCooldown ? "Aguarde 5 min (limite: 2 por vez)" : "Pedido de atenção (MSN style!)"}><AlertTriangle className="w-3.5 h-3.5" /></button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-2 space-y-2">
        {loadingOlder && <div className="flex justify-center py-2"><div className="flex gap-1"><span className="typing-dot w-1.5 h-1.5 rounded-full bg-primary" /><span className="typing-dot w-1.5 h-1.5 rounded-full bg-primary" /><span className="typing-dot w-1.5 h-1.5 rounded-full bg-primary" /></div></div>}
        {!hasMore && messages.length > 0 && <p className="text-center text-[9px] text-muted-foreground py-1">Início da conversa</p>}
        {messages.map((msg) => {
          const isMine = msg.sender_id === user?.id;
          return (
            <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"} fade-in group`}>
              <div className={`flex gap-1.5 max-w-[85%] ${isMine ? "flex-row-reverse" : ""}`}>
                {!isMine && (
                  msg.sender?.avatar_url
                    ? <img src={msg.sender.avatar_url} alt="" className="w-6 h-6 rounded-full object-cover flex-shrink-0 mt-auto" />
                    : <div className="w-6 h-6 rounded-full bg-secondary flex-shrink-0 flex items-center justify-center text-[8px] font-medium text-secondary-foreground mt-auto">{msg.sender ? initials(msg.sender.display_name) : "?"}</div>
                )}
                <div className="relative">
                  {!isMine && msg.sender && <p className="text-[9px] text-muted-foreground mb-0.5 px-1">{msg.sender.display_name}</p>}
                  <div className={`rounded-xl px-3 py-1.5 text-xs ${isMine ? "bg-[hsl(var(--bubble-sent))] text-[hsl(var(--bubble-sent-foreground))] rounded-br-sm" : "bg-[hsl(var(--bubble-received))] text-[hsl(var(--bubble-received-foreground))] rounded-bl-sm"}`}>
                    {msg.file_url && (
                      <div className="mb-1">
                        {isImage(msg.file_type) ? (
                          <div className="relative cursor-pointer" onClick={() => setPreviewFile({ url: msg.file_url!, name: msg.file_name || "img", type: msg.file_type })}>
                            <img src={msg.file_url} alt={msg.file_name || "img"} className="rounded-md max-w-full max-h-32 object-cover" />
                            <button onClick={(e) => { e.stopPropagation(); handleDownload(msg.file_url!, msg.file_name || "file", msg.id); }} className="absolute top-1 right-1 p-1 rounded-md bg-background/60 hover:bg-background/80 transition-colors"><Download className="w-3 h-3" /></button>
                          </div>
                        ) : isVideo(msg.file_type) ? (
                          <div className="relative cursor-pointer rounded-md bg-black/20 flex items-center justify-center h-24 w-full" onClick={() => setPreviewFile({ url: msg.file_url!, name: msg.file_name || "video", type: msg.file_type })}>
                            <Play className="w-8 h-8 text-white/80" />
                            <span className="absolute bottom-1 left-1.5 text-[9px] text-white/70 truncate max-w-[80%]">{msg.file_name || "Vídeo"}</span>
                            <button onClick={(e) => { e.stopPropagation(); handleDownload(msg.file_url!, msg.file_name || "file", msg.id); }} className="absolute top-1 right-1 p-1 rounded-md bg-background/60 hover:bg-background/80 transition-colors"><Download className="w-3 h-3" /></button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 p-1.5 rounded-md bg-background/20 cursor-pointer hover:bg-background/30 transition-colors" onClick={() => setPreviewFile({ url: msg.file_url!, name: msg.file_name || "Arquivo", type: msg.file_type })}>
                            <FileText className="w-3 h-3 flex-shrink-0" /><span className="text-[10px] truncate flex-1">{msg.file_name || "Arquivo"}</span>
                            <button onClick={(e) => { e.stopPropagation(); handleDownload(msg.file_url!, msg.file_name || "file", msg.id); }} className="p-0.5 rounded hover:bg-background/30 transition-colors"><Download className="w-3 h-3" /></button>
                          </div>
                        )}
                        {downloadStatus[msg.id] === "downloading" && <span className="text-[9px] text-muted-foreground">Baixando...</span>}
                        {downloadStatus[msg.id] === "done" && <span className="text-[9px] text-primary">✓ Concluído</span>}
                      </div>
                    )}
                    {msg.content && <p className="whitespace-pre-wrap break-words">{msg.content}</p>}
                    <div className={`flex items-center gap-1 mt-0.5 ${isMine ? "justify-end" : ""}`}>
                      <span className={`text-[9px] ${isMine ? "text-foreground/60" : "text-muted-foreground"}`}>{formatTime(msg.created_at)}</span>
                      {isMine && <span className={`text-[9px] ${msg.read_at ? "text-blue-400" : "text-foreground/40"}`}>{msg.read_at ? "✓✓" : "✓"}</span>}
                    </div>
                  </div>
                  <MessageReactions messageId={msg.id} />
                  {canDelete(msg) && (
                    <button onClick={() => handleDelete(msg.id)} className="absolute -left-5 top-1/2 -translate-y-1/2 p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/20 text-destructive transition-all" title="Apagar para todos"><Trash2 className="w-3 h-3" /></button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Emoji picker */}
      {showEmojis && (
        <div className="px-2 pb-1">
          <div className="flex flex-wrap gap-1 p-2 rounded-lg bg-secondary/50 border border-border/30">
            {BASIC_EMOJIS.map((e) => (<button key={e} onClick={() => { setInput((prev) => prev + e); setShowEmojis(false); }} className="text-lg hover:scale-125 transition-transform">{e}</button>))}
          </div>
        </div>
      )}

      {/* Typing indicator */}
      {typingUsers.size > 0 && (
        <div className="px-3 py-1 flex items-center gap-1.5">
          <div className="flex gap-0.5"><span className="typing-dot w-1 h-1 rounded-full bg-primary" /><span className="typing-dot w-1 h-1 rounded-full bg-primary" /><span className="typing-dot w-1 h-1 rounded-full bg-primary" /></div>
          <span className="text-[10px] text-muted-foreground italic">{Array.from(typingUsers.values()).join(", ")} {typingUsers.size === 1 ? "está" : "estão"} digitando...</span>
        </div>
      )}

      {/* Input */}
      <div className="p-2 border-t border-border/30">
        <div className="flex items-end gap-1 bg-secondary/30 rounded-lg p-1.5">
          <button onClick={() => setShowEmojis(!showEmojis)} className="p-1 rounded hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"><Smile className="w-4 h-4" /></button>
          <label className="p-1 rounded hover:bg-secondary/50 text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
            <input type="file" className="hidden" onChange={handleFileUpload} />
            {uploading ? <span className="flex gap-0.5"><span className="typing-dot w-1 h-1 rounded-full bg-primary" /><span className="typing-dot w-1 h-1 rounded-full bg-primary" /><span className="typing-dot w-1 h-1 rounded-full bg-primary" /></span> : <Paperclip className="w-4 h-4" />}
          </label>
          <textarea value={input} onChange={(e) => { setInput(e.target.value); emitTyping(); }} onKeyDown={handleKeyDown} placeholder="Mensagem..." rows={1} className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground resize-none focus:outline-none max-h-20 py-1.5" style={{ minHeight: "28px" }} />
          <button onClick={handleSend} disabled={!input.trim()} className="p-1.5 rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-30 transition-all"><Send className="w-3.5 h-3.5" /></button>
        </div>
      </div>
      {previewFile && <FilePreviewModal url={previewFile.url} name={previewFile.name} type={previewFile.type} onClose={() => setPreviewFile(null)} />}
    </div>
  );
};

export default ChatConversationArea;
