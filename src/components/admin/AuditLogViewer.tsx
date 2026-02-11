import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ScrollText } from "lucide-react";

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

  useEffect(() => {
    const fetch = async () => {
      const { data } = await (supabase as any)
        .from("audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (data) setLogs(data);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div className="text-muted-foreground p-4">Carregando...</div>;

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-foreground mb-6 flex items-center gap-2">
        <ScrollText className="w-5 h-5" /> Log de Atividades
      </h2>

      {logs.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-8">Nenhuma atividade registrada.</p>
      ) : (
        <div className="space-y-1.5">
          {logs.map((log) => {
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
