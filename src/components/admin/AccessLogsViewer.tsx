import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Globe, Monitor, Clock, Users, RefreshCw } from "lucide-react";

interface AccessLog {
  id: string;
  ip_address: string | null;
  user_agent: string | null;
  path: string | null;
  created_at: string;
}

const AccessLogsViewer = () => {
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, uniqueIps: 0, today: 0 });

  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("access_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (!error && data) {
      setLogs(data);

      const uniqueIps = new Set(data.map((l: AccessLog) => l.ip_address)).size;
      const todayStr = new Date().toISOString().split("T")[0];
      const todayCount = data.filter((l: AccessLog) =>
        l.created_at.startsWith(todayStr)
      ).length;

      setStats({ total: data.length, uniqueIps, today: todayCount });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const parseDevice = (ua: string | null) => {
    if (!ua) return "Desconhecido";
    if (ua.includes("Mobile")) return "📱 Mobile";
    if (ua.includes("Tablet")) return "📱 Tablet";
    return "💻 Desktop";
  };

  const parseBrowser = (ua: string | null) => {
    if (!ua) return "—";
    if (ua.includes("Chrome") && !ua.includes("Edg")) return "Chrome";
    if (ua.includes("Edg")) return "Edge";
    if (ua.includes("Firefox")) return "Firefox";
    if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
    return "Outro";
  };

  if (loading) return <div className="text-muted-foreground p-4">Carregando...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl font-bold text-foreground">🌐 Rastreamento de Acessos</h2>
        <button
          onClick={fetchLogs}
          className="menu-btn flex items-center gap-2 text-sm"
        >
          <RefreshCw className="w-4 h-4" /> Atualizar
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="glass rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total de acessos</p>
          </div>
        </div>
        <div className="glass rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center">
            <Globe className="w-5 h-5 text-accent" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{stats.uniqueIps}</p>
            <p className="text-xs text-muted-foreground">IPs únicos</p>
          </div>
        </div>
        <div className="glass rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-500/15 flex items-center justify-center">
            <Clock className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{stats.today}</p>
            <p className="text-xs text-muted-foreground">Acessos hoje</p>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      {logs.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-8">Nenhum acesso registrado.</p>
      ) : (
        <div className="glass rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">IP</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Dispositivo</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Navegador</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Página</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Data/Hora</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-border/10 hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-foreground">{log.ip_address || "—"}</td>
                    <td className="px-4 py-3 text-foreground">{parseDevice(log.user_agent)}</td>
                    <td className="px-4 py-3 text-foreground">{parseBrowser(log.user_agent)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{log.path || "/"}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {new Date(log.created_at).toLocaleString("pt-BR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessLogsViewer;
