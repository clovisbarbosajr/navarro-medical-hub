import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { Search, Filter, CalendarIcon, Trash2, Download, MessageCircle, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface ConversationRow {
  id: string; type: string; name: string | null;
  participants: { display_name: string; department: string }[];
  message_count: number; last_message_at: string | null;
}

interface MessageRow {
  id: string; content: string | null; sender_name: string;
  sender_dept: string; created_at: string; file_name: string | null; is_attention: boolean;
}

const AdminHistoryTab = () => {
  const { toast } = useToast();
  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [departments, setDepartments] = useState<string[]>([]);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    const { data: convs } = await supabase.from("chat_conversations").select("id, type, name, created_at").order("updated_at", { ascending: false });
    if (!convs) { setLoading(false); return; }
    const convIds = convs.map(c => c.id);
    const [partsRes, msgsRes] = await Promise.all([
      supabase.from("chat_participants").select("conversation_id, user_id").in("conversation_id", convIds),
      supabase.from("chat_messages").select("conversation_id, created_at").in("conversation_id", convIds).order("created_at", { ascending: false }),
    ]);
    const allUserIds = [...new Set(partsRes.data?.map(p => p.user_id) || [])];
    const { data: profiles } = await supabase.from("user_profiles").select("user_id, display_name, department").in("user_id", allUserIds);
    const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
    const countMap = new Map<string, number>();
    const lastMsgMap = new Map<string, string>();
    msgsRes.data?.forEach(m => { countMap.set(m.conversation_id, (countMap.get(m.conversation_id) || 0) + 1); if (!lastMsgMap.has(m.conversation_id)) lastMsgMap.set(m.conversation_id, m.created_at); });
    const partsMap = new Map<string, string[]>();
    partsRes.data?.forEach(p => { const arr = partsMap.get(p.conversation_id) || []; arr.push(p.user_id); partsMap.set(p.conversation_id, arr); });
    const enriched: ConversationRow[] = convs.map(conv => ({
      ...conv, participants: (partsMap.get(conv.id) || []).map(uid => profileMap.get(uid)).filter(Boolean) as any[],
      message_count: countMap.get(conv.id) || 0, last_message_at: lastMsgMap.get(conv.id) || null,
    }));
    setConversations(enriched);
    const depts = new Set<string>();
    enriched.forEach(c => c.participants.forEach(p => depts.add(p.department)));
    setDepartments(Array.from(depts).sort());
    setLoading(false);
  }, []);

  const fetchMessages = useCallback(async (convId: string) => {
    setLoadingMsgs(true); setSelectedConv(convId);
    const { data } = await supabase.from("chat_messages").select("id, content, sender_id, created_at, file_name, is_attention").eq("conversation_id", convId).order("created_at", { ascending: true });
    if (!data) { setLoadingMsgs(false); return; }
    const senderIds = [...new Set(data.map(m => m.sender_id))];
    const { data: profiles } = await supabase.from("user_profiles").select("user_id, display_name, department").in("user_id", senderIds);
    const profileMap = new Map(profiles?.map(p => [p.user_id, p]));
    setMessages(data.map(m => ({ id: m.id, content: m.content, sender_name: profileMap.get(m.sender_id)?.display_name || "Desconhecido", sender_dept: profileMap.get(m.sender_id)?.department || "Geral", created_at: m.created_at, file_name: m.file_name, is_attention: m.is_attention })));
    setLoadingMsgs(false);
  }, []);

  const handleDeleteMessage = async (msgId: string) => {
    if (!confirm("Apagar esta mensagem permanentemente?")) return;
    await supabase.from("chat_messages").delete().eq("id", msgId);
    setMessages(prev => prev.filter(m => m.id !== msgId));
  };

  const handleDeleteAllMessages = async () => {
    if (!selectedConv) return;
    if (!confirm("Apagar TODAS as mensagens desta conversa? Esta ação é irreversível.")) return;
    const { data: session } = await supabase.auth.getSession();
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-manage`, {
      method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.session?.access_token}` },
      body: JSON.stringify({ action: "delete_conversation_messages", conversationId: selectedConv }),
    });
    if (res.ok) { setMessages([]); toast({ title: "Histórico apagado", description: "Todas as mensagens foram removidas." }); fetchConversations(); }
  };

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  const filtered = conversations.filter(c => {
    const convName = c.type === "group" ? c.name || "Grupo" : c.participants.map(p => p.display_name).join(", ");
    if (search && !convName.toLowerCase().includes(search.toLowerCase())) return false;
    if (deptFilter !== "all" && !c.participants.some(p => p.department === deptFilter)) return false;
    if (dateFrom && c.last_message_at && new Date(c.last_message_at) < dateFrom) return false;
    if (dateTo) { const end = new Date(dateTo); end.setHours(23, 59, 59, 999); if (c.last_message_at && new Date(c.last_message_at) > end) return false; }
    return true;
  });

  const exportCSV = () => {
    if (selectedConv && messages.length > 0) {
      const headers = ["Data/Hora", "Remetente", "Departamento", "Mensagem", "Arquivo", "Atenção"];
      const rows = messages.map(m => [format(new Date(m.created_at), "dd/MM/yyyy HH:mm:ss"), m.sender_name, m.sender_dept, (m.content || "").replace(/"/g, '""'), m.file_name || "", m.is_attention ? "Sim" : "Não"]);
      const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `conversa_${selectedConv.slice(0, 8)}.csv`; a.click();
    } else {
      const headers = ["Tipo", "Nome", "Participantes", "Departamentos", "Mensagens", "Última Msg"];
      const rows = filtered.map(c => [c.type === "group" ? "Grupo" : "Direto", c.type === "group" ? (c.name || "Grupo") : c.participants.map(p => p.display_name).join(" / "), c.participants.map(p => p.display_name).join(", "), [...new Set(c.participants.map(p => p.department))].join(", "), String(c.message_count), c.last_message_at ? format(new Date(c.last_message_at), "dd/MM HH:mm") : "—"]);
      const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "conversas_admin.csv"; a.click();
    }
  };

  const getConvName = (c: ConversationRow) => c.type === "group" ? (c.name || "Grupo") : c.participants.map(p => p.display_name).join(" / ");

  if (selectedConv) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => { setSelectedConv(null); setMessages([]); }}>← Voltar às conversas</Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportCSV}><Download className="w-4 h-4 mr-1.5" /> CSV</Button>
            <Button variant="destructive" size="sm" onClick={handleDeleteAllMessages}><Trash2 className="w-4 h-4 mr-1.5" /> Apagar tudo</Button>
          </div>
        </div>
        {loadingMsgs ? (
          <div className="flex justify-center py-12"><div className="flex gap-1.5"><span className="typing-dot w-2.5 h-2.5 rounded-full bg-primary" /><span className="typing-dot w-2.5 h-2.5 rounded-full bg-primary" /><span className="typing-dot w-2.5 h-2.5 rounded-full bg-primary" /></div></div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">{messages.length} mensagens</p>
            <div className="space-y-1">
              {messages.map(msg => (
                <div key={msg.id} className="glass rounded-lg p-3 flex items-start gap-3 group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-semibold text-foreground">{msg.sender_name}</span>
                      <span className="text-[10px] text-muted-foreground">{msg.sender_dept}</span>
                      <span className="text-[10px] text-muted-foreground">{format(new Date(msg.created_at), "dd/MM/yyyy HH:mm:ss")}</span>
                      {msg.is_attention && <span className="text-[10px] text-destructive font-semibold">⚠️ ATENÇÃO</span>}
                    </div>
                    {msg.content && <p className="text-sm text-foreground whitespace-pre-wrap">{msg.content}</p>}
                    {msg.file_name && <p className="text-xs text-primary mt-0.5">📎 {msg.file_name}</p>}
                  </div>
                  <button onClick={() => handleDeleteMessage(msg.id)} className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/20 text-destructive transition-all flex-shrink-0" title="Apagar mensagem"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
              {messages.length === 0 && <p className="text-center py-12 text-muted-foreground">Nenhuma mensagem</p>}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar conversa..." className="pl-9" /></div>
        <Select value={deptFilter} onValueChange={setDeptFilter}><SelectTrigger className="w-[180px]"><Filter className="w-4 h-4 mr-1.5" /><SelectValue placeholder="Departamento" /></SelectTrigger><SelectContent><SelectItem value="all">Todos departamentos</SelectItem>{departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select>
        <Popover><PopoverTrigger asChild><Button variant="outline" className={cn("w-[150px] justify-start text-left font-normal", !dateFrom && "text-muted-foreground")}><CalendarIcon className="w-4 h-4 mr-1.5" />{dateFrom ? format(dateFrom, "dd/MM/yyyy") : "Data início"}</Button></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} className="p-3 pointer-events-auto" /></PopoverContent></Popover>
        <Popover><PopoverTrigger asChild><Button variant="outline" className={cn("w-[150px] justify-start text-left font-normal", !dateTo && "text-muted-foreground")}><CalendarIcon className="w-4 h-4 mr-1.5" />{dateTo ? format(dateTo, "dd/MM/yyyy") : "Data fim"}</Button></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={dateTo} onSelect={setDateTo} className="p-3 pointer-events-auto" /></PopoverContent></Popover>
        {(search || deptFilter !== "all" || dateFrom || dateTo) && <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setDeptFilter("all"); setDateFrom(undefined); setDateTo(undefined); }}>Limpar</Button>}
        <Button variant="outline" size="sm" onClick={exportCSV}><Download className="w-4 h-4 mr-1.5" /> CSV</Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-4 text-center"><p className="text-2xl font-bold text-primary">{filtered.length}</p><p className="text-xs text-muted-foreground">Conversas</p></div>
        <div className="glass rounded-xl p-4 text-center"><p className="text-2xl font-bold text-primary">{filtered.filter(c => c.type === "group").length}</p><p className="text-xs text-muted-foreground">Grupos</p></div>
        <div className="glass rounded-xl p-4 text-center"><p className="text-2xl font-bold text-primary">{filtered.reduce((s, c) => s + c.message_count, 0)}</p><p className="text-xs text-muted-foreground">Mensagens</p></div>
        <div className="glass rounded-xl p-4 text-center"><p className="text-2xl font-bold text-primary">{departments.length}</p><p className="text-xs text-muted-foreground">Departamentos</p></div>
      </div>
      {loading ? (
        <div className="flex justify-center py-12"><div className="flex gap-1.5"><span className="typing-dot w-2.5 h-2.5 rounded-full bg-primary" /><span className="typing-dot w-2.5 h-2.5 rounded-full bg-primary" /><span className="typing-dot w-2.5 h-2.5 rounded-full bg-primary" /></div></div>
      ) : (
        <div className="space-y-2">
          {filtered.map(conv => (
            <button key={conv.id} onClick={() => fetchMessages(conv.id)} className="w-full glass rounded-xl p-4 flex items-center gap-4 hover:bg-secondary/30 transition-colors text-left">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${conv.type === "group" ? "bg-primary/15" : "bg-secondary"}`}>{conv.type === "group" ? <Users className="w-5 h-5 text-primary" /> : <MessageCircle className="w-5 h-5 text-muted-foreground" />}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2"><span className="font-medium text-sm truncate">{getConvName(conv)}</span><span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground flex-shrink-0">{conv.type === "group" ? "Grupo" : "Direto"}</span></div>
                <span className="text-[11px] text-muted-foreground">{[...new Set(conv.participants.map(p => p.department))].join(", ")}</span>
              </div>
              <div className="text-right flex-shrink-0"><p className="text-sm font-semibold text-primary">{conv.message_count}</p><p className="text-[10px] text-muted-foreground">msgs</p>{conv.last_message_at && <p className="text-[10px] text-muted-foreground">{format(new Date(conv.last_message_at), "dd/MM HH:mm")}</p>}</div>
            </button>
          ))}
          {filtered.length === 0 && <p className="text-center py-12 text-muted-foreground">Nenhuma conversa encontrada</p>}
        </div>
      )}
    </div>
  );
};

export default AdminHistoryTab;
