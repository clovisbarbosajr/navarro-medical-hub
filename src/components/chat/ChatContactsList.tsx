import { useState } from "react";
import { Search, Users, MessageCircle } from "lucide-react";
import { useChatAuth } from "@/contexts/ChatAuthContext";
import type { Profile, Conversation } from "@/hooks/useChat";

const DEPT_COLORS: Record<string, { bg: string; text: string }> = {
  Administrativo: { bg: "bg-red-400", text: "text-red-400" },
  Financeiro: { bg: "bg-amber-400", text: "text-amber-400" },
  TI: { bg: "bg-blue-400", text: "text-blue-400" },
  RH: { bg: "bg-pink-400", text: "text-pink-400" },
  Comercial: { bg: "bg-orange-400", text: "text-orange-400" },
  Marketing: { bg: "bg-purple-400", text: "text-purple-400" },
  Operacional: { bg: "bg-emerald-400", text: "text-emerald-400" },
  Geral: { bg: "bg-teal-400", text: "text-teal-400" },
};
const getDeptColor = (dept: string) => DEPT_COLORS[dept] || { bg: "bg-primary", text: "text-primary" };

interface Props {
  contacts: Profile[]; conversations: Conversation[]; activeConversationId?: string;
  onSelectConversation: (id: string) => void; onStartDirect: (userId: string) => void;
  onCreateGroup?: () => void; onCloseConversation?: () => void; isAdmin: boolean;
  attentionConvIds?: Set<string>;
}

const ChatContactsList = ({ contacts, conversations, activeConversationId, onSelectConversation, onStartDirect, onCreateGroup, isAdmin, attentionConvIds = new Set() }: Props) => {
  const { user } = useChatAuth();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"chats" | "contacts">("contacts");
  const initials = (name: string) => name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  const getConversationName = (conv: Conversation) => conv.type === "group" ? conv.name || "Grupo" : conv.participants.find((p) => p.user_id !== user?.id)?.display_name || "Conversa";
  const onlineContacts = contacts.filter((c) => c.is_online && c.user_id !== user?.id);
  const grouped = onlineContacts.reduce<Record<string, Profile[]>>((acc, c) => { const dept = c.department || "Geral"; if (!acc[dept]) acc[dept] = []; acc[dept].push(c); return acc; }, {});
  const filteredConvs = conversations.filter((c) => getConversationName(c).toLowerCase().includes(search.toLowerCase()));
  const filteredGrouped = Object.entries(grouped).reduce<Record<string, Profile[]>>((acc, [dept, profs]) => { const f = profs.filter((p) => p.display_name.toLowerCase().includes(search.toLowerCase())); if (f.length) acc[dept] = f; return acc; }, {});
  const unreadConvUserIds = new Set(conversations.filter(c => c.unread_count > 0 && c.type === "direct").flatMap(c => c.participants.filter(p => p.user_id !== user?.id).map(p => p.user_id)));
  // Build set of user IDs that have attention conversations
  const attentionUserIds = new Set(
    conversations.filter(c => attentionConvIds.has(c.id) && c.type === "direct")
      .flatMap(c => c.participants.filter(p => p.user_id !== user?.id).map(p => p.user_id))
  );

  return (
    <div className="w-44 flex-shrink-0 flex flex-col border-r border-border/30 bg-secondary/10">
      <div className="p-2"><div className="relative"><Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..." className="w-full pl-7 pr-2 py-1.5 rounded-md bg-secondary/50 border border-border/30 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors" /></div></div>
      <div className="flex border-b border-border/30 px-1">
        <button onClick={() => setTab("contacts")} className={`flex-1 py-1.5 text-[10px] font-medium transition-colors ${tab === "contacts" ? "text-primary border-b border-primary" : "text-muted-foreground"}`}><Users className="w-3 h-3 inline mr-0.5" /> Contatos</button>
        <button onClick={() => setTab("chats")} className={`flex-1 py-1.5 text-[10px] font-medium transition-colors ${tab === "chats" ? "text-primary border-b border-primary" : "text-muted-foreground"}`}><MessageCircle className="w-3 h-3 inline mr-0.5" /> Chats</button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {tab === "contacts" ? (
          <div className="p-1">
            {/* Group creation is done in admin panel only */}
            {Object.entries(filteredGrouped).map(([dept, profiles]) => (
              <div key={dept} className="mb-2">
                <div className="flex items-center gap-1 px-1.5 mb-0.5"><div className={`w-2 h-2 rounded-full ${getDeptColor(dept).bg}`} /><span className={`text-[9px] font-semibold uppercase tracking-wider ${getDeptColor(dept).text}`}>{dept}</span></div>
                {profiles.map((p) => {
                  const hasUnread = unreadConvUserIds.has(p.user_id);
                  const hasAttention = attentionUserIds.has(p.user_id);
                  return (
                    <button key={p.user_id} onClick={() => onStartDirect(p.user_id)} className={`w-full flex items-center gap-1.5 px-1.5 py-1 rounded-md hover:bg-secondary/50 transition-colors ${hasAttention ? "tab-blink-attention" : hasUnread ? "contact-flash" : ""}`}>
                      <div className="relative flex-shrink-0">
                        {p.avatar_url ? <img src={p.avatar_url} alt={p.display_name} className="w-6 h-6 rounded-full object-cover" /> : <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold text-white ${getDeptColor(p.department).bg}`}>{initials(p.display_name)}</div>}
                        <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-card ${p.is_online ? getDeptColor(p.department).bg : "bg-muted-foreground/40"}`} />
                      </div>
                      <span className={`text-[11px] truncate ${hasUnread ? "font-semibold " + getDeptColor(p.department).text : "text-foreground"}`}>{p.display_name}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-1 space-y-0.5">
            {filteredConvs.map((conv) => {
              const isActive = conv.id === activeConversationId;
              const hasUnread = conv.unread_count > 0;
              const other = conv.type === "direct" ? conv.participants.find((p) => p.user_id !== user?.id) : null;
              const otherProfile = other ? contacts.find(c => c.user_id === other.user_id) : null;
              const dept = otherProfile?.department || "Geral";
              const deptColor = getDeptColor(dept);
              return (
                <button key={conv.id} onClick={() => onSelectConversation(conv.id)} className={`w-full flex items-center gap-1.5 p-1.5 rounded-md text-left transition-all ${isActive ? "bg-primary/15 border border-primary/20" : attentionConvIds.has(conv.id) ? "tab-blink-attention" : hasUnread ? "contact-flash" : "hover:bg-secondary/50"}`}>
                  <div className="relative flex-shrink-0">
                    {conv.type === "group" ? <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center"><Users className="w-3 h-3 text-secondary-foreground" /></div>
                    : other?.avatar_url ? <img src={other.avatar_url} alt="" className="w-6 h-6 rounded-full object-cover" />
                    : <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold text-white ${deptColor.bg}`}>{initials(getConversationName(conv))}</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center"><span className={`text-[11px] truncate ${hasUnread ? deptColor.text + " font-semibold" : "text-foreground font-medium"}`}>{getConversationName(conv)}</span>
                    {hasUnread && <span className={`ml-1 w-4 h-4 rounded-full text-[8px] flex items-center justify-center font-bold flex-shrink-0 ${deptColor.bg} text-white`}>{conv.unread_count}</span>}</div>
                    {conv.last_message?.content && <p className="text-[9px] text-muted-foreground truncate">{conv.last_message.content}</p>}
                  </div>
                </button>
              );
            })}
            {filteredConvs.length === 0 && <p className="text-center text-[10px] text-muted-foreground py-4">Nenhuma conversa</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatContactsList;
