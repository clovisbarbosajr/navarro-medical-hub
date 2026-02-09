import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { HolidayTheme } from "@/types/database";
import { Pencil, ToggleLeft, ToggleRight, Palette, Stethoscope, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const HolidayThemesManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<HolidayTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<HolidayTheme> | null>(null);

  const fetchItems = async () => {
    const { data, error } = await (supabase as any)
      .from("holiday_themes")
      .select("*")
      .order("holiday_date", { ascending: true });
    if (!error && data) setItems(data);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const handleToggle = async (item: HolidayTheme) => {
    // Check if within activation window
    const today = new Date().toISOString().split("T")[0];
    const canActivate = today >= item.activation_start && today <= item.activation_end;

    if (!canActivate && !item.enabled) {
      toast({
        title: "Fora do período",
        description: `Este tema só pode ser ativado entre ${new Date(item.activation_start).toLocaleDateString("pt-BR")} e ${new Date(item.activation_end).toLocaleDateString("pt-BR")}.`,
        variant: "destructive",
      });
      return;
    }

    // If enabling, disable all others first
    if (!item.enabled) {
      await (supabase as any).from("holiday_themes").update({ enabled: false }).neq("id", item.id);
    }

    const { error } = await (supabase as any)
      .from("holiday_themes")
      .update({ enabled: !item.enabled })
      .eq("id", item.id);

    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else {
      toast({ title: item.enabled ? "Tema desativado" : "Tema ativado! 🎉" });
      fetchItems();
    }
  };

  const handleSave = async () => {
    if (!editing?.id) return;

    const { error } = await (supabase as any)
      .from("holiday_themes")
      .update({
        activation_start: editing.activation_start,
        activation_end: editing.activation_end,
        enabled: editing.enabled,
      })
      .eq("id", editing.id);

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Tema atualizado!" });
      setEditing(null);
      fetchItems();
    }
  };

  const isWithinWindow = (item: HolidayTheme) => {
    const today = new Date().toISOString().split("T")[0];
    return today >= item.activation_start && today <= item.activation_end;
  };

  if (loading) return <div className="text-muted-foreground p-4">Carregando...</div>;

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-xl font-bold text-foreground">🎨 Temas de Feriados</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Ative um tema para alterar as cores da intranet. Cada tema tem uma janela de ativação automática.
        </p>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 60 }}>
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={() => setEditing(null)} />
          <div className="relative glass-strong rounded-2xl p-6 max-w-md w-full shadow-2xl animate-fade-slide-up">
            <h3 className="font-display font-bold text-lg text-foreground mb-4">
              {editing.emoji} {editing.name}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Início da ativação</label>
                <input
                  type="date"
                  value={editing.activation_start || ""}
                  onChange={(e) => setEditing({ ...editing, activation_start: e.target.value })}
                  className="w-full h-10 rounded-xl border border-input bg-secondary/50 px-3 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Fim da ativação</label>
                <input
                  type="date"
                  value={editing.activation_end || ""}
                  onChange={(e) => setEditing({ ...editing, activation_end: e.target.value })}
                  className="w-full h-10 rounded-xl border border-input bg-secondary/50 px-3 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={handleSave} className="menu-btn flex-1 text-sm">Salvar</button>
                <button onClick={() => setEditing(null)} className="flex-1 h-10 rounded-xl border border-input bg-secondary/50 text-foreground text-sm hover:bg-secondary transition-colors">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Theme Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((item) => {
          const inWindow = isWithinWindow(item);
          const overrides = item.css_overrides as Record<string, string>;
          const primaryColor = overrides["--primary"] || "210 100% 56%";
          const accentColor = overrides["--accent"] || "174 72% 56%";

          return (
            <div
              key={item.id}
              className={`glass rounded-xl p-4 transition-all ${item.enabled ? "ring-2 ring-primary/50 shadow-lg" : ""}`}
            >
              {/* Color Preview */}
              <div className="flex gap-2 mb-3">
                <div
                  className="w-8 h-8 rounded-lg"
                  style={{ backgroundColor: `hsl(${primaryColor})` }}
                  title="Cor primária"
                />
                <div
                  className="w-8 h-8 rounded-lg"
                  style={{ backgroundColor: `hsl(${accentColor})` }}
                  title="Cor accent"
                />
              </div>

              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-display font-semibold text-sm text-foreground">
                      {item.emoji} {item.name}
                    </p>
                    {item.is_professional_date && (
                      <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-accent/20 text-accent font-medium flex items-center gap-0.5">
                        <Stethoscope className="w-2.5 h-2.5" />
                        Profissional
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>

              {/* Suggested message preview */}
              {item.is_professional_date && item.suggested_message && (
                <div className="text-[9px] text-muted-foreground/70 italic mb-2 line-clamp-2">
                  💡 "{item.suggested_message}"
                </div>
              )}

              {item.is_professional_date && item.image_bank_url && (
                <a
                  href={item.image_bank_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[9px] text-primary hover:text-primary/80 transition-colors mb-2"
                >
                  <ExternalLink className="w-2.5 h-2.5" />
                  Imagens gratuitas
                </a>
              )}

              <div className="text-[10px] text-muted-foreground mb-3 space-y-0.5">
                <p>📅 Feriado: {new Date(item.holiday_date).toLocaleDateString("pt-BR")}</p>
                <p>⏰ Janela: {new Date(item.activation_start).toLocaleDateString("pt-BR")} — {new Date(item.activation_end).toLocaleDateString("pt-BR")}</p>
                <p className={inWindow ? "text-green-400 font-medium" : "text-muted-foreground"}>
                  {inWindow ? "✅ Dentro da janela" : "⏳ Fora da janela"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggle(item)}
                  className={`flex-1 h-8 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-all ${
                    item.enabled
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : "bg-secondary/50 text-muted-foreground border border-input hover:bg-secondary"
                  }`}
                >
                  {item.enabled ? <ToggleRight className="w-3 h-3" /> : <ToggleLeft className="w-3 h-3" />}
                  {item.enabled ? "Ativo" : "Inativo"}
                </button>
                <button
                  onClick={() => setEditing(item)}
                  className="h-8 w-8 rounded-lg border border-input bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <Pencil className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HolidayThemesManager;
