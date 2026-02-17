import { useState, useEffect } from "react";
import { Send, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Department { id: string; name: string; color: string; }

const AdminBroadcastTab = () => {
  const { toast } = useToast();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [content, setContent] = useState("");
  const [targetDept, setTargetDept] = useState("all");
  const [isAttention, setIsAttention] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => { supabase.from("departments").select("id, name, color").order("name").then(({ data }) => { if (data) setDepartments(data); }); }, []);

  const handleSend = async () => {
    if (!content.trim()) return;
    setSending(true);
    const { data: session } = await supabase.auth.getSession();
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-manage`, {
      method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.session?.access_token}` },
      body: JSON.stringify({ action: "broadcast_message", content: content.trim(), targetDepartment: targetDept, isAttention }),
    });
    const result = await res.json();
    setSending(false);
    if (res.ok) { toast({ title: "Mensagem enviada!", description: `Enviada para ${result.sentCount} usuário(s).` }); setContent(""); setIsAttention(false); }
    else { toast({ title: "Erro", description: result.error, variant: "destructive" }); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="glass rounded-xl p-6 space-y-4">
        <div className="text-center space-y-1">
          <h2 className="text-lg font-display font-semibold text-foreground">Mensagem em Massa</h2>
          <p className="text-sm text-muted-foreground">Envie uma mensagem para todos os usuários ou um departamento específico</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Destinatários</label>
          <Select value={targetDept} onValueChange={setTargetDept}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">🌐 Todos os usuários</SelectItem>{departments.map(d => (<SelectItem key={d.id} value={d.name}><span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: d.color }} />{d.name}</span></SelectItem>))}</SelectContent></Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Mensagem</label>
          <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Digite a mensagem que será enviada..." rows={4} className="w-full rounded-lg bg-secondary/50 border border-border/50 p-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all" />
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsAttention(!isAttention)} className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${isAttention ? "bg-destructive/15 border-destructive/30 text-destructive" : "border-border/50 text-muted-foreground hover:bg-secondary/30"}`}>
            <AlertTriangle className="w-4 h-4" /><span className="text-sm font-medium">Pedido de atenção</span>
          </button>
          {isAttention && <span className="text-[11px] text-destructive/80">As janelas dos destinatários irão tremer (MSN style)</span>}
        </div>
        <Button onClick={handleSend} disabled={sending || !content.trim()} className="w-full" size="lg">
          {sending ? (<div className="flex items-center gap-2"><div className="flex gap-0.5"><span className="typing-dot w-1.5 h-1.5 rounded-full bg-primary-foreground" /><span className="typing-dot w-1.5 h-1.5 rounded-full bg-primary-foreground" /><span className="typing-dot w-1.5 h-1.5 rounded-full bg-primary-foreground" /></div>Enviando...</div>) : (<><Send className="w-4 h-4 mr-2" />Enviar para {targetDept === "all" ? "todos" : targetDept}</>)}
        </Button>
      </div>
      {content.trim() && (
        <div className="glass rounded-xl p-4 space-y-2">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Pré-visualização</p>
          <div className="rounded-xl px-3 py-2 bg-[hsl(var(--bubble-sent))] text-[hsl(var(--bubble-sent-foreground))] text-sm whitespace-pre-wrap">{content}</div>
          {isAttention && <p className="text-[10px] text-destructive">⚠️ Com pedido de atenção</p>}
        </div>
      )}
    </div>
  );
};

export default AdminBroadcastTab;
