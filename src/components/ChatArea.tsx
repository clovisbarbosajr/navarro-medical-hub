import { useState, useEffect, useRef, useCallback } from "react";
import { Send, Paperclip, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useChatAuth } from "@/contexts/ChatAuthContext";
import type { Message } from "@/hooks/useChat";

interface ChatAreaProps { conversationId: string; conversationName: string; fetchMessages: (id: string) => Promise<Message[]>; sendMessage: (id: string, content: string, fileUrl?: string, fileName?: string, fileType?: string) => Promise<void>; markAsRead: (id: string) => Promise<void>; }

const ChatArea = ({ conversationId, conversationName, fetchMessages, sendMessage, markAsRead }: ChatAreaProps) => {
  const { user } = useChatAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const loadMessages = useCallback(async () => { const msgs = await fetchMessages(conversationId); setMessages(msgs); markAsRead(conversationId); }, [conversationId, fetchMessages, markAsRead]);
  useEffect(() => { loadMessages(); }, [loadMessages]);
  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    const channel = supabase.channel(`msgs-${conversationId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `conversation_id=eq.${conversationId}` }, () => { loadMessages(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [conversationId, loadMessages]);

  const handleSend = async () => { const text = input.trim(); if (!text) return; setInput(""); await sendMessage(conversationId, text); };
  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 10 * 1024 * 1024) { alert("Arquivo muito grande. Limite: 10MB"); return; }
    setUploading(true);
    const filePath = `${user.id}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from("chat-files").upload(filePath, file);
    if (!error) { const { data: urlData } = supabase.storage.from("chat-files").getPublicUrl(filePath); await sendMessage(conversationId, "", urlData.publicUrl, file.name, file.type); }
    setUploading(false); e.target.value = "";
  };

  const formatTime = (date: string) => new Date(date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const initials = (name: string) => name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  const isImage = (type: string | null) => type?.startsWith("image/");

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => {
          const isMine = msg.sender_id === user?.id;
          return (
            <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"} fade-in`}>
              <div className={`flex gap-2 max-w-[75%] ${isMine ? "flex-row-reverse" : ""}`}>
                {!isMine && <div className="w-8 h-8 rounded-full bg-secondary flex-shrink-0 flex items-center justify-center text-xs font-medium text-secondary-foreground mt-auto">{msg.sender ? initials(msg.sender.display_name) : "?"}</div>}
                <div>
                  {!isMine && msg.sender && <p className="text-xs text-muted-foreground mb-1 px-1">{msg.sender.display_name}</p>}
                  <div className={`rounded-2xl px-4 py-2.5 ${isMine ? "bg-primary text-primary-foreground rounded-br-md" : "bg-secondary text-secondary-foreground rounded-bl-md"}`}>
                    {msg.file_url && (
                      <div className="mb-2">
                        {isImage(msg.file_type) ? <a href={msg.file_url} target="_blank" rel="noopener noreferrer"><img src={msg.file_url} alt={msg.file_name || "image"} className="rounded-lg max-w-full max-h-48 object-cover" /></a>
                        : <a href={msg.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 rounded-lg bg-background/20 hover:bg-background/30 transition-colors"><FileText className="w-4 h-4" /><span className="text-sm truncate">{msg.file_name || "Arquivo"}</span></a>}
                      </div>
                    )}
                    {msg.content && <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>}
                    <div className={`flex items-center gap-1 mt-1 ${isMine ? "justify-end" : ""}`}>
                      <span className={`text-[10px] ${isMine ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{formatTime(msg.created_at)}</span>
                      {isMine && msg.read_at && <span className="text-[10px] text-primary-foreground/60">✓✓</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="p-3 border-t border-border/30">
        <div className="flex items-end gap-2 glass rounded-xl p-2">
          <label className="p-2 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
            <input type="file" className="hidden" onChange={handleFileUpload} />
            {uploading ? <span className="flex gap-0.5"><span className="typing-dot w-1.5 h-1.5 rounded-full bg-primary" /><span className="typing-dot w-1.5 h-1.5 rounded-full bg-primary" /><span className="typing-dot w-1.5 h-1.5 rounded-full bg-primary" /></span> : <Paperclip className="w-5 h-5" />}
          </label>
          <textarea ref={textareaRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Digite uma mensagem..." rows={1} className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none max-h-32 py-2" style={{ minHeight: "36px" }} />
          <button onClick={handleSend} disabled={!input.trim()} className="p-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-30 transition-all"><Send className="w-5 h-5" /></button>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
