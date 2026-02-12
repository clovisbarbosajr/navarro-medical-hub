import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { resizeAndUpload } from "@/lib/imageResize";
import type { Birthday } from "@/types/database";
import { Plus, Pencil, Trash2, X, Save, ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { logAction } from "@/lib/auditLog";

const BirthdaysManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<Birthday[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Birthday> | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchItems = async () => {
    const { data, error } = await (supabase as any)
      .from("birthdays")
      .select("*")
      .order("birth_date", { ascending: true });
    if (!error && data) setItems(data);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const handleSave = async () => {
    if (!editing?.name || !editing?.birth_date) return;

    const payload = {
      name: editing.name,
      birth_date: editing.birth_date,
      photo_url: editing.photo_url || null,
      created_by: user?.id,
    };

    let error;
    if (editing.id) {
      ({ error } = await (supabase as any).from("birthdays").update(payload).eq("id", editing.id));
    } else {
      ({ error } = await (supabase as any).from("birthdays").insert(payload));
    }

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      await logAction(editing.id ? "editou" : "criou", "aniversariante", editing.name);
      toast({ title: editing.id ? "Atualizado!" : "Cadastrado!" });
      setEditing(null);
      fetchItems();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este aniversariante?")) return;
    const item = items.find(i => i.id === id);
    const { error } = await (supabase as any).from("birthdays").delete().eq("id", id);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else {
      await logAction("deletou", "aniversariante", item?.name);
      fetchItems();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await resizeAndUpload(supabase, file, "birthdays", 200, 200);
    if (url) {
      setEditing((prev) => prev ? { ...prev, photo_url: url } : null);
    }
    setUploading(false);
  };

  // Group by month
  const groupedByMonth: Record<string, Birthday[]> = {};
  items.forEach((item) => {
    const month = new Date(item.birth_date + "T00:00:00").toLocaleDateString("pt-BR", { month: "long" });
    if (!groupedByMonth[month]) groupedByMonth[month] = [];
    groupedByMonth[month].push(item);
  });

  if (loading) return <div className="text-muted-foreground p-4">Carregando...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl font-bold text-foreground">🎂 Aniversariantes</h2>
        <button
          onClick={() => setEditing({ name: "", birth_date: "", photo_url: "" })}
          className="menu-btn flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" /> Novo
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
              {editing.id ? "Editar" : "Novo Aniversariante"}
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  {editing.photo_url ? (
                    <img src={editing.photo_url} alt="Foto" className="w-16 h-16 rounded-full object-cover ring-2 ring-primary/30" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-2xl">
                      🎂
                    </div>
                  )}
                </div>
                <label className="flex-1 flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-input cursor-pointer hover:bg-secondary/30 transition-colors">
                  <ImageIcon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {uploading ? "Enviando..." : "Foto"}
                  </span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Nome completo</label>
                <input
                  value={editing.name || ""}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="w-full h-10 rounded-xl border border-input bg-secondary/50 px-3 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Nome do colaborador"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Data de nascimento</label>
                <input
                  type="date"
                  value={editing.birth_date || ""}
                  onChange={(e) => setEditing({ ...editing, birth_date: e.target.value })}
                  className="w-full h-10 rounded-xl border border-input bg-secondary/50 px-3 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <button onClick={handleSave} className="menu-btn w-full flex items-center justify-center gap-2 text-sm">
                <Save className="w-4 h-4" /> Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List grouped by month */}
      {items.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-8">Nenhum aniversariante cadastrado.</p>
      ) : (
        Object.entries(groupedByMonth).reverse().map(([month, people]) => (
          <div key={month} className="mb-6">
            <h3 className="font-display font-semibold text-sm text-primary capitalize mb-2">📅 {month}</h3>
            <div className="space-y-2">
              {people.map((person) => {
                const day = new Date(person.birth_date + "T00:00:00").getDate();
                return (
                  <div key={person.id} className="glass rounded-xl p-3 flex items-center gap-3">
                    {person.photo_url ? (
                      <img src={person.photo_url} alt={person.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/30 flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-lg flex-shrink-0">🎂</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{person.name}</p>
                      <p className="text-xs text-muted-foreground">Dia {day}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => setEditing(person)} className="p-2 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(person.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default BirthdaysManager;
