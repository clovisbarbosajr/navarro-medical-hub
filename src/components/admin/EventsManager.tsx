import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Pencil, Trash2, X, Save, CalendarDays, MapPin, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { logAction } from "@/lib/auditLog";

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  location: string | null;
  color: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

const EventsManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Event> | null>(null);

  const fetchItems = async () => {
    const { data, error } = await (supabase as any)
      .from("events")
      .select("*")
      .order("event_date", { ascending: true });
    if (!error && data) setItems(data);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const handleSave = async () => {
    if (!editing?.title || !editing?.event_date) return;

    const payload = {
      title: editing.title,
      description: editing.description || null,
      event_date: editing.event_date,
      event_time: editing.event_time || null,
      location: editing.location || null,
      color: editing.color || "#6366f1",
      created_by: user?.id,
    };

    let error;
    if (editing.id) {
      ({ error } = await (supabase as any).from("events").update(payload).eq("id", editing.id));
    } else {
      ({ error } = await (supabase as any).from("events").insert(payload));
    }

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      await logAction(editing.id ? "editou" : "criou", "evento", editing.title);
      toast({ title: editing.id ? "Atualizado!" : "Criado!" });
      setEditing(null);
      fetchItems();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este evento?")) return;
    const item = items.find(i => i.id === id);
    const { error } = await (supabase as any).from("events").delete().eq("id", id);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else {
      await logAction("deletou", "evento", item?.title);
      fetchItems();
    }
  };

  const COLORS = ["#6366f1", "#f43f5e", "#10b981", "#f59e0b", "#3b82f6", "#8b5cf6"];

  if (loading) return <div className="text-muted-foreground p-4">Carregando...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl font-bold text-foreground">📅 Calendário de Eventos</h2>
        <button
          onClick={() => setEditing({ title: "", event_date: "", color: "#6366f1" })}
          className="menu-btn flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" /> Novo Evento
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
              {editing.id ? "Editar Evento" : "Novo Evento"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Título</label>
                <input
                  value={editing.title || ""}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  className="w-full h-10 rounded-xl border border-input bg-secondary/50 px-3 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Nome do evento"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Descrição</label>
                <textarea
                  value={editing.description || ""}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  className="w-full rounded-xl border border-input bg-secondary/50 px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[60px]"
                  placeholder="Detalhes do evento"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Data</label>
                  <input
                    type="date"
                    value={editing.event_date || ""}
                    onChange={(e) => setEditing({ ...editing, event_date: e.target.value })}
                    className="w-full h-10 rounded-xl border border-input bg-secondary/50 px-3 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Horário</label>
                  <input
                    type="time"
                    value={editing.event_time || ""}
                    onChange={(e) => setEditing({ ...editing, event_time: e.target.value })}
                    className="w-full h-10 rounded-xl border border-input bg-secondary/50 px-3 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Local</label>
                <input
                  value={editing.location || ""}
                  onChange={(e) => setEditing({ ...editing, location: e.target.value })}
                  className="w-full h-10 rounded-xl border border-input bg-secondary/50 px-3 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Local do evento"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Cor</label>
                <div className="flex gap-2">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setEditing({ ...editing, color: c })}
                      className={`w-8 h-8 rounded-full transition-transform ${editing.color === c ? "scale-125 ring-2 ring-foreground" : "hover:scale-110"}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              <button onClick={handleSave} className="menu-btn w-full flex items-center justify-center gap-2 text-sm">
                <Save className="w-4 h-4" /> Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Events List */}
      {items.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-8">Nenhum evento cadastrado.</p>
      ) : (
        <div className="space-y-3">
          {items.map((event) => {
            const date = new Date(event.event_date + "T00:00:00");
            const isPast = date < new Date(new Date().toDateString());
            return (
              <div
                key={event.id}
                className={`glass rounded-xl p-4 flex items-start gap-4 ${isPast ? "opacity-50" : ""}`}
              >
                <div
                  className="w-12 h-12 rounded-xl flex flex-col items-center justify-center text-white font-bold flex-shrink-0"
                  style={{ backgroundColor: event.color }}
                >
                  <span className="text-[10px] uppercase leading-none">
                    {date.toLocaleDateString("pt-BR", { month: "short" })}
                  </span>
                  <span className="text-lg leading-none">{date.getDate()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground">{event.title}</p>
                  {event.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{event.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1">
                    {event.event_time && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {event.event_time.slice(0, 5)}
                      </span>
                    )}
                    {event.location && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {event.location}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => setEditing(event)} className="p-2 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(event.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EventsManager;
