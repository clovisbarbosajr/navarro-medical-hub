import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { MenuLink } from "@/types/database";
import { Plus, Pencil, Trash2, X, Save, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = [
  { value: "sistemas", label: "Sistemas" },
  { value: "ferramentas", label: "Ferramentas" },
  { value: "helpdesk", label: "Helpdesk" },
];

const MenuLinksManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<MenuLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<MenuLink> | null>(null);

  const fetchItems = async () => {
    const { data, error } = await (supabase as any)
      .from("menu_links")
      .select("*")
      .order("category", { ascending: true })
      .order("sort_order", { ascending: true });
    if (!error && data) setItems(data);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const handleSave = async () => {
    if (!editing?.label || !editing?.href || !editing?.category) return;

    const payload = {
      category: editing.category,
      label: editing.label,
      href: editing.href,
      sort_order: editing.sort_order ?? 0,
      open_mode: editing.open_mode ?? "new_tab",
      created_by: user?.id,
    };

    let error;
    if (editing.id) {
      ({ error } = await (supabase as any).from("menu_links").update(payload).eq("id", editing.id));
    } else {
      ({ error } = await (supabase as any).from("menu_links").insert(payload));
    }

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: editing.id ? "Atualizado!" : "Criado!" });
      setEditing(null);
      fetchItems();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este link?")) return;
    const { error } = await (supabase as any).from("menu_links").delete().eq("id", id);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else fetchItems();
  };

  // Group by category
  const grouped: Record<string, MenuLink[]> = {};
  items.forEach((item) => {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
  });

  if (loading) return <div className="text-muted-foreground p-4">Carregando...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl font-bold text-foreground">🔗 Menu & Links</h2>
        <button
          onClick={() => setEditing({ label: "", href: "", category: "sistemas" as any, sort_order: 0, open_mode: "new_tab" as any })}
          className="menu-btn flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" /> Novo Link
        </button>
      </div>

      {/* Editor Modal */}
      {editing && (
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 60 }}>
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={() => setEditing(null)} />
          <div className="relative glass-strong rounded-2xl p-6 max-w-md w-full shadow-2xl animate-fade-slide-up">
            <button onClick={() => setEditing(null)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-display font-bold text-lg text-foreground mb-4">
              {editing.id ? "Editar Link" : "Novo Link"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Categoria</label>
                <select
                  value={editing.category || "sistemas"}
                  onChange={(e) => setEditing({ ...editing, category: e.target.value as any })}
                  className="w-full h-10 rounded-xl border border-input bg-secondary/50 px-3 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Nome do Link</label>
                <input
                  value={editing.label || ""}
                  onChange={(e) => setEditing({ ...editing, label: e.target.value })}
                  className="w-full h-10 rounded-xl border border-input bg-secondary/50 px-3 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Ex: Prontuário Eletrônico"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">URL</label>
                <input
                  value={editing.href || ""}
                  onChange={(e) => setEditing({ ...editing, href: e.target.value })}
                  className="w-full h-10 rounded-xl border border-input bg-secondary/50 px-3 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Abrir como</label>
                <select
                  value={editing.open_mode || "new_tab"}
                  onChange={(e) => setEditing({ ...editing, open_mode: e.target.value as any })}
                  className="w-full h-10 rounded-xl border border-input bg-secondary/50 px-3 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none"
                >
                  <option value="new_tab">Nova aba</option>
                  <option value="same_tab">Mesma aba (redireciona)</option>
                  <option value="iframe">Na mesma página (iframe)</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Ordem</label>
                <input
                  type="number"
                  value={editing.sort_order ?? 0}
                  onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })}
                  className="w-24 h-10 rounded-xl border border-input bg-secondary/50 px-3 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <button onClick={handleSave} className="menu-btn w-full flex items-center justify-center gap-2 text-sm">
                <Save className="w-4 h-4" /> Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grouped List */}
      {CATEGORIES.map((cat) => {
        const catItems = grouped[cat.value] || [];
        return (
          <div key={cat.value} className="mb-6">
            <h3 className="font-display font-semibold text-sm text-primary mb-2">{cat.label}</h3>
            {catItems.length === 0 ? (
              <p className="text-xs text-muted-foreground ml-2">Nenhum link nesta categoria.</p>
            ) : (
              <div className="space-y-2">
                {catItems.map((item) => (
                  <div key={item.id} className="glass rounded-xl p-3 flex items-center gap-3">
                    <ExternalLink className="w-4 h-4 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{item.label}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.href}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">#{item.sort_order}</span>
                    <button onClick={() => setEditing(item)} className="p-2 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MenuLinksManager;
