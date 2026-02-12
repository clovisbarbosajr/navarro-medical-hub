import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ScrollText, Filter, RefreshCw } from "lucide-react";

interface AuditEntry {
  id: string;
  user_email: string;
  action: string;
  entity_type: string;
  entity_title: string | null;
  created_at: string;
}

const ACTION_EMOJI: Record<string, string> = {
  criou: "🆕",
  editou: "✏️",
  deletou: "🗑️",
  ativou: "✅",
  desativou: "⛔",
};

const AuditLogViewer = () => {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterUser, setFilterUser] = useState("");
  const [filterType, setFilterType] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    const { data } = await (supabase as any)
      .from("audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (data) setLogs(data);
    setLoading(false);
  };

  useEffect(() => { fetchLogs(); }, []);

  const users = [...new Set(logs.map((l) => l.user_email).filter(Boolean))];
  const types = [...new Set(logs.map((l) => l.entity_type).filter(Boolean))];

  const filtered = logs.filter((l) => {
    if (filterUser && l.user_email !== filterUser) return false;
    if (filterType && l.entity_type !== filterType) return false;
    return true;
  });

  if (loading) return <div className="text-muted-foreground p-4">Carregando...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
          <ScrollText className="w-5 h-5" /> Log de Atividades
        </h2>
        <button onClick={fetchLogs} className="menu-btn flex items-center gap-2 text-sm">
          <RefreshCw className="w-4 h-4" /> Atualizar
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            className="h-9 rounded-xl border border-input bg-secondary/50 px-3 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">Todos os usuários</option>
            {users.map((u) => (
              <option key={u} value={u}>{u?.split("@")[0]}</option>
            ))}
          </select>
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="h-9 rounded-xl border border-input bg-secondary/50 px-3 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">Todos os tipos</option>
          {types.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <span className="text-xs text-muted-foreground self-center">
          {filtered.length} registros
        </span>
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-8">Nenhuma atividade registrada.</p>
      ) : (
        <div className="space-y-1.5">
          {filtered.map((log) => {
            const date = new Date(log.created_at);
            const time = date.toLocaleString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            });
            const userName = log.user_email?.split("@")[0] || "—";
            const emoji = ACTION_EMOJI[log.action] || "📝";

            return (
              <div key={log.id} className="glass rounded-xl px-4 py-3 flex items-start gap-3">
                <span className="text-lg flex-shrink-0 mt-0.5">{emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">
                    <span className="font-semibold capitalize">{userName}</span>
                    {" "}{log.action}{" "}
                    <span className="text-primary">{log.entity_type}</span>
                    {log.entity_title && (
                      <span className="text-muted-foreground"> — "{log.entity_title}"</span>
                    )}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{time}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AuditLogViewer;
