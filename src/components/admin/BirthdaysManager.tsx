import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { resizeAndUpload } from "@/lib/imageResize";
import type { Birthday } from "@/types/database";
import { Plus, Pencil, Trash2, X, Save, ImageIcon, AlertTriangle } from "lucide-react";
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

  // Find birthdays missing surname (only one word in name)
  const missingSurname = items.filter(i => i.name.trim().split(/\s+/).length < 2);

  const validateName = (name: string): string | null => {
    const trimmed = name.trim();
    if (!trimmed) return "Nome é obrigatório.";
    if (trimmed.includes("-")) return "Hífens não são permitidos no nome.";
    if (trimmed.split(/\s+/).length < 2) return "Adicione o sobrenome do colaborador.";
    return null;
  };

  const handleSave = async () => {
    if (!editing?.name || !editing?.birth_date) return;

    const nameError = validateName(editing.name);
    if (nameError) {
      toast({ title: "Atenção", description: nameError, variant: "destructive" });
      return;
    }

    const payload = {
      name: editing.name.trim(),
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
      // Try to match birthday name to a chat user profile and sync the photo
      await syncPhotoWithUserProfile(editing.name.trim(), editing.photo_url || null);

      await logAction(editing.id ? "editou" : "criou", "aniversariante", editing.name);
      toast({ title: editing.id ? "Atualizado!" : "Cadastrado!" });
      setEditing(null);
      fetchItems();
    }
  };

  const syncPhotoWithUserProfile = async (birthdayName: string, photoUrl: string | null) => {
    if (!photoUrl) return;
    try {
      // Match by first name + last name
      const nameParts = birthdayName.trim().split(/\s+/);
      if (nameParts.length < 2) return;
      const firstName = nameParts[0].toLowerCase();
      const lastName = nameParts[nameParts.length - 1].toLowerCase();

      const { data: profiles } = await supabase.from("user_profiles").select("user_id, display_name, avatar_url");
      if (!profiles) return;

      const match = profiles.find(p => {
        const pParts = p.display_name.toLowerCase().split(/\s+/);
        return pParts[0] === firstName && pParts[pParts.length - 1] === lastName;
      });

      if (match && !match.avatar_url) {
        await (supabase as any).from("user_profiles").update({ avatar_url: photoUrl }).eq("user_id", match.user_id);
      }
    } catch (err) {
      console.error("Sync photo error:", err);
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

      {/* Alert for missing surnames */}
      {missingSurname.length > 0 && (
        <div className="mb-6 p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 flex items-start gap-3 animate-pulse-subtle">
          <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground">⚠️ Sobrenome faltando!</p>
            <p className="text-xs text-muted-foreground mt-1">
              Os seguintes aniversariantes precisam de sobrenome:{" "}
              <strong>{missingSurname.map(m => m.name).join(", ")}</strong>.
              Clique no ícone de edição para corrigir.
            </p>
          </div>
        </div>
      )}

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
                <label className="text-sm text-muted-foreground mb-1 block">Nome e sobrenome</label>
                <input
                  value={editing.name || ""}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="w-full h-10 rounded-xl border border-input bg-secondary/50 px-3 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Ex: Maria Silva"
                />
                {editing.name && validateName(editing.name) && (
                  <p className="text-xs text-destructive mt-1">{validateName(editing.name)}</p>
                )}
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
                const needsSurname = person.name.trim().split(/\s+/).length < 2;
                return (
                  <div key={person.id} className={`glass rounded-xl p-3 flex items-center gap-3 ${needsSurname ? "ring-2 ring-yellow-500/50" : ""}`}>
                    {person.photo_url ? (
                      <img src={person.photo_url} alt={person.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/30 flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-lg flex-shrink-0">🎂</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm text-foreground truncate">{person.name}</p>
                        {needsSurname && <AlertTriangle className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />}
                      </div>
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
