import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { resizeAndUpload } from "@/lib/imageResize";
import type { GalleryImage } from "@/types/database";
import { Plus, Pencil, Trash2, X, Save, ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const GalleryManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<GalleryImage> | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchItems = async () => {
    const { data, error } = await (supabase as any)
      .from("gallery_images")
      .select("*")
      .order("sort_order", { ascending: true });
    if (!error && data) setItems(data);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const handleSave = async () => {
    if (!editing?.title || !editing?.image_url) {
      toast({ title: "Preencha título e imagem", variant: "destructive" });
      return;
    }

    const payload = {
      title: editing.title,
      description: editing.description || null,
      image_url: editing.image_url,
      sort_order: editing.sort_order ?? items.length,
      created_by: user?.id,
    };

    let error;
    if (editing.id) {
      ({ error } = await (supabase as any).from("gallery_images").update(payload).eq("id", editing.id));
    } else {
      ({ error } = await (supabase as any).from("gallery_images").insert(payload));
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
    if (!confirm("Excluir esta imagem?")) return;
    const { error } = await (supabase as any).from("gallery_images").delete().eq("id", id);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else fetchItems();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    // Auto-resize to campaign dimensions (800x400 = 2:1 ratio)
    const url = await resizeAndUpload(supabase, file, "gallery", 800, 400);
    if (url) {
      setEditing((prev) => prev ? { ...prev, image_url: url } : null);
      toast({ title: "Imagem redimensionada e enviada!" });
    } else {
      toast({ title: "Erro ao enviar imagem", variant: "destructive" });
    }
    setUploading(false);
  };

  if (loading) return <div className="text-muted-foreground p-4">Carregando...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">📸 Campanhas & Galeria</h2>
          <p className="text-xs text-muted-foreground mt-1">Imagens enviadas são automaticamente redimensionadas para o formato correto (800×400).</p>
        </div>
        <button
          onClick={() => setEditing({ title: "", description: "", image_url: "", sort_order: items.length })}
          className="menu-btn flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" /> Nova
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
              {editing.id ? "Editar Campanha" : "Nova Campanha"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Título</label>
                <input
                  value={editing.title || ""}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  className="w-full h-10 rounded-xl border border-input bg-secondary/50 px-3 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Título da campanha"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Descrição</label>
                <textarea
                  value={editing.description || ""}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  rows={2}
                  className="w-full rounded-xl border border-input bg-secondary/50 px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  placeholder="Descrição breve"
                />
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
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Imagem (auto-redimensionada para 800×400)</label>
                {editing.image_url && (
                  <img src={editing.image_url} alt="Preview" className="w-full h-40 object-cover rounded-xl mb-2" />
                )}
                <label className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-input cursor-pointer hover:bg-secondary/30 transition-colors">
                  <ImageIcon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {uploading ? "Redimensionando e enviando..." : "Escolher imagem (qualquer formato)"}
                  </span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
              <button onClick={handleSave} disabled={!editing.image_url} className={`menu-btn w-full flex items-center justify-center gap-2 text-sm ${!editing.image_url ? "opacity-50" : ""}`}>
                <Save className="w-4 h-4" /> Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      {items.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-8">Nenhuma campanha cadastrada.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {items.map((item) => (
            <div key={item.id} className="glass rounded-xl overflow-hidden group">
              <img src={item.image_url} alt={item.title} className="w-full h-32 object-cover" />
              <div className="p-3 flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                </div>
                <button onClick={() => setEditing(item)} className="p-2 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GalleryManager;
