import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Announcement } from "@/types/database";
import { Plus, Pencil, Trash2, X, Save, ToggleLeft, ToggleRight, CalendarDays } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AnnouncementsManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Announcement> | null>(null);

  const fetchItems = async () => {
    const { data, error } = await (supabase as any)
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setItems(data);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const handleSave = async () => {
    if (!editing?.title || !editing?.body) return;

    const payload = {
      title: editing.title,
      body: editing.body,
      enabled: editing.enabled ?? true,
      end_date: editing.end_date || null,
      created_by: user?.id,
    };

    let error;
    if (editing.id) {
      ({ error } = await (supabase as any).from("announcements").update(payload).eq("id", editing.id));
    } else {
      ({ error } = await (supabase as any).from("announcements").insert(payload));
    }

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: editing.id ? "Atualizado!" : "Criado!" });
      setEditing(null);
      fetchItems();
    }
  };

  const handleToggle = async (item: Announcement) => {
    const { error } = await (supabase as any)
      .from("announcements")
      .update({ enabled: !item.enabled })
      .eq("id", item.id);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else fetchItems();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este aviso?")) return;
    const { error } = await (supabase as any).from("announcements").delete().eq("id", id);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else fetchItems();
  };

  if (loading) return <div className="text-muted-foreground p-4">Carregando...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl font-bold text-foreground">⚠️ Avisos</h2>
        <button
          onClick={() => setEditing({ title: "", body: "", enabled: true, end_date: null })}
          className="menu-btn flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" /> Novo Aviso
        </button>
      </div>

      {/* Editor Modal */}
      {editing && (
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 60 }}>
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={() => setEditing(null)} />
          <div className="relative glass-strong rounded-2xl p-6 max-w-lg w-full shadow-2xl animate-fade-slide-up">
            <button onClick={() => setEditing(null)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-display font-bold text-lg text-foreground mb-4">
              {editing.id ? "Editar Aviso" : "Novo Aviso"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Título</label>
                <input
                  value={editing.title || ""}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  className="w-full h-10 rounded-xl border border-input bg-secondary/50 px-3 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Título do aviso"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Mensagem</label>
                <textarea
                  value={editing.body || ""}
                  onChange={(e) => setEditing({ ...editing, body: e.target.value })}
                  rows={4}
                  className="w-full rounded-xl border border-input bg-secondary/50 px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  placeholder="Texto do aviso..."
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                    <CalendarDays className="w-3 h-3" /> Exibir até (opcional)
                  </label>
                  <input
                    type="date"
                    value={editing.end_date || ""}
                    onChange={(e) => setEditing({ ...editing, end_date: e.target.value || null })}
                    className="w-full h-10 rounded-xl border border-input bg-secondary/50 px-3 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Ativo</label>
                  <button
                    type="button"
                    onClick={() => setEditing({ ...editing, enabled: !editing.enabled })}
                    className={`h-10 px-4 rounded-xl text-sm font-medium transition-all ${
                      editing.enabled
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : "bg-secondary/50 text-muted-foreground border border-input"
                    }`}
                  >
                    {editing.enabled ? "Sim" : "Não"}
                  </button>
                </div>
              </div>
              <button onClick={handleSave} className="menu-btn w-full flex items-center justify-center gap-2 text-sm">
                <Save className="w-4 h-4" /> Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">Nenhum aviso cadastrado.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="glass rounded-xl p-4 flex items-center gap-4">
              <button onClick={() => handleToggle(item)} className="flex-shrink-0">
                {item.enabled ? (
                  <ToggleRight className="w-6 h-6 text-green-400" />
                ) : (
                  <ToggleLeft className="w-6 h-6 text-muted-foreground" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-sm truncate ${item.enabled ? "text-foreground" : "text-muted-foreground"}`}>
                  {item.title}
                </p>
                <p className="text-xs text-muted-foreground truncate">{item.body}</p>
                {item.end_date && (
                  <p className="text-[10px] text-primary mt-1">Até: {new Date(item.end_date).toLocaleDateString("pt-BR")}</p>
                )}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => setEditing(item)} className="p-2 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AnnouncementsManager;
