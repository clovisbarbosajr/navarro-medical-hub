import { useState } from "react";
import { Search, Users, MessageCircle, Plus, LogOut } from "lucide-react";
import { useChatAuth } from "@/contexts/ChatAuthContext";
import type { Profile, Conversation } from "@/hooks/useChat";

interface ChatSidebarProps { contacts: Profile[]; conversations: Conversation[]; activeConversationId?: string; onSelectConversation: (id: string) => void; onStartDirect: (userId: string) => void; onCreateGroup: () => void; }

const ChatSidebar = ({ contacts, conversations, activeConversationId, onSelectConversation, onStartDirect, onCreateGroup }: ChatSidebarProps) => {
  const { user, profile, signOut } = useChatAuth();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"chats" | "contacts">("chats");

  const getConversationName = (conv: Conversation) => { if (conv.type === "group") return conv.name || "Grupo"; return conv.participants.find((p) => p.user_id !== user?.id)?.display_name || "Conversa"; };
  const getConversationAvatar = (conv: Conversation) => { if (conv.type === "group") return null; return conv.participants.find((p) => p.user_id !== user?.id); };
  const grouped = contacts.reduce<Record<string, Profile[]>>((acc, c) => { const dept = c.department || "Geral"; if (!acc[dept]) acc[dept] = []; acc[dept].push(c); return acc; }, {});
  const filteredConversations = conversations.filter((c) => getConversationName(c).toLowerCase().includes(search.toLowerCase()));
  const filteredGrouped = Object.entries(grouped).reduce<Record<string, Profile[]>>((acc, [dept, profs]) => { const f = profs.filter((p) => p.display_name.toLowerCase().includes(search.toLowerCase())); if (f.length) acc[dept] = f; return acc; }, {});
  const initials = (name: string) => name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="flex flex-col h-full w-72 lg:w-80 glass-strong border-r border-border/30">
      <div className="p-4 border-b border-border/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">{profile ? initials(profile.display_name) : "?"}</div>
          <div className="flex-1 min-w-0"><p className="text-sm font-medium text-foreground truncate">{profile?.display_name}</p><p className="text-xs text-muted-foreground">{profile?.department}</p></div>
          <button onClick={signOut} className="p-2 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"><LogOut className="w-4 h-4" /></button>
        </div>
        <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..." className="w-full pl-9 pr-3 py-2 rounded-lg bg-secondary/50 border border-border/30 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors" /></div>
      </div>
      <div className="flex border-b border-border/30">
        <button onClick={() => setTab("chats")} className={`flex-1 py-2.5 text-sm font-medium transition-colors ${tab === "chats" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}><MessageCircle className="w-4 h-4 inline mr-1.5" />Conversas</button>
        <button onClick={() => setTab("contacts")} className={`flex-1 py-2.5 text-sm font-medium transition-colors ${tab === "contacts" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}><Users className="w-4 h-4 inline mr-1.5" />Contatos</button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {tab === "chats" ? (
          <div className="p-2 space-y-0.5">
            <button onClick={onCreateGroup} className="w-full flex items-center gap-2 p-2.5 rounded-lg text-sm text-primary hover:bg-primary/10 transition-colors"><Plus className="w-4 h-4" />Novo grupo</button>
            {filteredConversations.map((conv) => {
              const avatar = getConversationAvatar(conv);
              const isActive = conv.id === activeConversationId;
              return (
                <button key={conv.id} onClick={() => onSelectConversation(conv.id)} className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-all ${isActive ? "bg-primary/10 border border-primary/20" : "hover:bg-secondary/50"}`}>
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-sm font-medium text-secondary-foreground">{conv.type === "group" ? <Users className="w-4 h-4" /> : initials(getConversationName(conv))}</div>
                    {avatar?.is_online && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-card" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-foreground truncate">{getConversationName(conv)}</span>
                      {conv.unread_count > 0 && <span className="ml-2 flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">{conv.unread_count}</span>}
                    </div>
                    {conv.last_message && <p className="text-xs text-muted-foreground truncate mt-0.5">{conv.last_message.content || "📎 Arquivo"}</p>}
                  </div>
                </button>
              );
            })}
            {filteredConversations.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">Nenhuma conversa ainda</p>}
          </div>
        ) : (
          <div className="p-2">
            {Object.entries(filteredGrouped).map(([dept, profiles]) => (
              <div key={dept} className="mb-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2.5 mb-1">{dept}</p>
                {profiles.map((p) => (
                  <button key={p.user_id} onClick={() => onStartDirect(p.user_id)} className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary/50 transition-colors">
                    <div className="relative">
                      <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-xs font-medium text-secondary-foreground">{initials(p.display_name)}</div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-card ${p.is_online ? "bg-green-500" : "bg-muted-foreground/40"}`} />
                    </div>
                    <div className="text-left"><p className="text-sm text-foreground">{p.display_name}</p><p className="text-xs text-muted-foreground">{p.department}</p></div>
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
