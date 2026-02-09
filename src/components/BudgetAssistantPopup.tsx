import { useState, useRef, useEffect } from "react";
import { X, Send, Bot, User, Trash2, Sparkles, Paperclip } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type Msg = { role: "user" | "assistant"; content: string };

interface PendingFile {
  name: string;
  mimeType: string;
  base64: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/budget-assistant`;

interface BudgetAssistantPopupProps {
  open: boolean;
  onClose: () => void;
}

const BudgetAssistantPopup = ({ open, onClose }: BudgetAssistantPopupProps) => {
  const { user, role } = useAuth();
  const isEditor = role === "admin" || role === "manager";
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [pendingFile, setPendingFile] = useState<PendingFile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 300);
    }
  }, [open]);

  const handleClear = () => {
    setMessages([]);
    setInput("");
    setPendingFile(null);
  };

  const handleClose = () => {
    handleClear();
    onClose();
  };

  const send = async () => {
    const trimmed = input.trim();
    if ((!trimmed && !pendingFile) || isLoading) return;

    const displayContent = pendingFile 
      ? `📎 ${pendingFile.name}${trimmed ? `\n${trimmed}` : ""}` 
      : trimmed;
    const userMsg: Msg = { role: "user", content: displayContent };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    
    const fileToSend = pendingFile;
    setInput("");
    setPendingFile(null);
    setIsLoading(true);

    let assistantSoFar = "";

    try {
      // Get auth token if user is logged in
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (user) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          headers["Authorization"] = `Bearer ${session.access_token}`;
        }
      } else {
        headers["Authorization"] = `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`;
      }

      const body: any = { messages: newMessages };
      if (fileToSend) {
        body.file = fileToSend;
      }

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      if (!resp.ok || !resp.body) {
        const err = await resp.json().catch(() => ({ error: "Erro de conexão" }));
        setMessages((prev) => [...prev, { role: "assistant", content: `❌ ${err.error || "Erro ao processar sua solicitação."}` }]);
        setIsLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              const current = assistantSoFar;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: current } : m));
                }
                return [...prev, { role: "assistant", content: current }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              const current = assistantSoFar;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: current } : m));
                }
                return [...prev, { role: "assistant", content: current }];
              });
            }
          } catch { /* ignore */ }
        }
      }
    } catch (e) {
      console.error("Stream error:", e);
      setMessages((prev) => [...prev, { role: "assistant", content: "❌ Erro de conexão. Tente novamente." }]);
    }

    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      {/* Chat window */}
      <div className="relative w-full max-w-2xl h-[85vh] max-h-[700px] rounded-2xl overflow-hidden shadow-2xl flex flex-col bg-background border border-border animate-in zoom-in-95 fade-in duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-primary to-accent">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-display font-bold text-white text-sm">Clovis (menino do computador) — Assistente Virtual</h3>
              <p className="text-white/70 text-[10px]">
                {isEditor ? "🔧 Modo Admin — você pode editar procedimentos" : "Cole seus procedimentos ou pergunte sobre valores"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button
                onClick={handleClear}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                title="Limpar conversa"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4 opacity-70">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Bot className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="font-display font-semibold text-foreground text-sm">Olá! Sou o Clovis (menino do computador) 👋</p>
                <p className="text-muted-foreground text-xs mt-1 max-w-sm">
                  Cole a lista de procedimentos do paciente e eu calculo o orçamento. Você também pode perguntar sobre valores de consultas e exames.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {[
                  "Quanto custa a consulta geral?",
                  "Consulta Dr Denise",
                  "Pacote Annual Private",
                  "Consulta Dr Ana Pinon",
                  ...(isEditor ? [
                    "🔧 Alterar valor de procedimento",
                    "📚 Adicionar informação à base",
                    "Quais seguros aceitamos?",
                  ] : []),
                ].map((s) => (
                  <button
                    key={s}
                    onClick={() => { setInput(s); }}
                    className="text-[11px] px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-secondary/50 text-foreground rounded-bl-md"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none [&_table]:text-xs [&_table]:w-full [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1 [&_th]:text-left [&_table]:border-collapse [&_th]:border-b [&_th]:border-border [&_td]:border-b [&_td]:border-border/50 [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_strong]:text-foreground">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>
              {msg.role === "user" && (
                <div className="w-7 h-7 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-accent" />
                </div>
              )}
            </div>
          ))}

          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex gap-2.5 justify-start">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-primary animate-pulse" />
              </div>
              <div className="bg-secondary/50 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="px-4 pb-4 pt-2 border-t border-border/50">
          {pendingFile && (
            <div className="flex items-center gap-2 mb-2 px-2 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-xs">
              <Paperclip className="w-3 h-3 text-primary flex-shrink-0" />
              <span className="truncate text-foreground">{pendingFile.name}</span>
              <button onClick={() => setPendingFile(null)} className="ml-auto text-muted-foreground hover:text-destructive">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          <div className="flex gap-2 items-end">
            {isEditor && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt,.json,.xlsx,.xls,.pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.gif"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const MAX_SIZE = 10 * 1024 * 1024; // 10MB
                      if (file.size > MAX_SIZE) {
                        setInput(`❌ Arquivo muito grande (máx 10MB). Tamanho: ${(file.size / 1024 / 1024).toFixed(1)}MB`);
                        e.target.value = "";
                        return;
                      }

                      const isText = /\.(csv|txt|json)$/i.test(file.name);
                      if (isText) {
                        const text = await file.text();
                        const preview = text.length > 3000 ? text.slice(0, 3000) + "\n...(arquivo truncado)" : text;
                        setInput(`📎 Arquivo: ${file.name}\n\n${preview}`);
                      } else {
                        // Read as base64 for binary files
                        const buffer = await file.arrayBuffer();
                        const bytes = new Uint8Array(buffer);
                        let binary = "";
                        for (let i = 0; i < bytes.length; i++) {
                          binary += String.fromCharCode(bytes[i]);
                        }
                        const base64 = btoa(binary);
                        setPendingFile({
                          name: file.name,
                          mimeType: file.type || "application/octet-stream",
                          base64,
                        });
                        setInput(`Analise e processe este arquivo`);
                      }
                      textareaRef.current?.focus();
                    } catch {
                      setInput(`❌ Não foi possível ler o arquivo "${file.name}".`);
                    }
                    e.target.value = "";
                  }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="w-10 h-10 rounded-xl border border-input bg-secondary/30 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 disabled:opacity-40 transition-colors flex-shrink-0"
                  title="Anexar arquivo (PDF, Excel, Word, Imagem, CSV, TXT)"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
              </>
            )}
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isEditor ? "Cole procedimentos, anexe arquivo ou faça uma pergunta..." : "Cole os procedimentos ou faça uma pergunta..."}
              rows={2}
              className="flex-1 resize-none rounded-xl border border-input bg-secondary/30 px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
              disabled={isLoading}
            />
            <button
              onClick={send}
              disabled={(!input.trim() && !pendingFile) || isLoading}
              className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 disabled:opacity-40 transition-colors flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetAssistantPopup;
