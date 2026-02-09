import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { resizeAndUpload } from "@/lib/imageResize";
import type { NewsItem } from "@/types/database";
import { Plus, Pencil, Trash2, X, Save, ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const EMPTY: Omit<NewsItem, "id" | "created_at" | "updated_at" | "created_by" | "published_at"> = {
  title: "",
  excerpt: "",
  image_url: "",
  category: "Geral",
};

const NewsManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<NewsItem> | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchItems = async () => {
    const { data, error } = await (supabase as any)
      .from("news")
      .select("*")
      .order("published_at", { ascending: false });
    if (!error && data) setItems(data);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const handleSave = async () => {
    if (!editing?.title) return;

    const payload = {
      title: editing.title,
      excerpt: editing.excerpt || null,
      image_url: editing.image_url || null,
      category: editing.category || "Geral",
      created_by: user?.id,
    };

    let error;
    if (editing.id) {
      ({ error } = await (supabase as any).from("news").update(payload).eq("id", editing.id));
    } else {
      ({ error } = await (supabase as any).from("news").insert(payload));
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
    if (!confirm("Excluir esta notícia?")) return;
    const { error } = await (supabase as any).from("news").delete().eq("id", id);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else fetchItems();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await resizeAndUpload(supabase, file, "news", 400, 300);
    if (url) {
      setEditing((prev) => prev ? { ...prev, image_url: url } : null);
    }
    setUploading(false);
  };

  if (loading) return <div className="text-muted-foreground p-4">Carregando...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl font-bold text-foreground">📰 Notícias</h2>
        <button onClick={() => setEditing({ ...EMPTY })} className="menu-btn flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Nova Notícia
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
              {editing.id ? "Editar Notícia" : "Nova Notícia"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Título</label>
                <input
                  value={editing.title || ""}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  className="w-full h-10 rounded-xl border border-input bg-secondary/50 px-3 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Título da notícia"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Resumo</label>
                <textarea
                  value={editing.excerpt || ""}
                  onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })}
                  rows={3}
                  className="w-full rounded-xl border border-input bg-secondary/50 px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  placeholder="Resumo da notícia"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Categoria</label>
                <input
                  value={editing.category || ""}
                  onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                  className="w-full h-10 rounded-xl border border-input bg-secondary/50 px-3 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Saúde, RH, Treinamento..."
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Imagem</label>
                {editing.image_url && (
                  <img src={editing.image_url} alt="Preview" className="w-full h-32 object-cover rounded-xl mb-2" />
                )}
                <label className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-input cursor-pointer hover:bg-secondary/30 transition-colors">
                  <ImageIcon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {uploading ? "Enviando..." : "Enviar imagem"}
                  </span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
              <button onClick={handleSave} className="menu-btn w-full flex items-center justify-center gap-2 text-sm">
                <Save className="w-4 h-4" /> Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">Nenhuma notícia cadastrada.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="glass rounded-xl p-4 flex items-center gap-4">
              {item.image_url && (
                <img src={item.image_url} alt={item.title} className="w-16 h-12 object-cover rounded-lg flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground truncate">{item.title}</p>
                <p className="text-xs text-muted-foreground truncate">{item.excerpt}</p>
                <span className="inline-block text-[9px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded-full mt-1">
                  {item.category}
                </span>
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

export default NewsManager;
