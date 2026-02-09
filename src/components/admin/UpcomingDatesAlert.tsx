import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { HolidayTheme } from "@/types/database";
import { CalendarClock, MessageSquarePlus, Palette, ExternalLink, X, PlusCircle } from "lucide-react";

interface UpcomingDate extends HolidayTheme {
  days_until: number;
}

interface Props {
  onCreateAnnouncement?: (title: string, body: string) => void;
}

const UpcomingDatesAlert = ({ onCreateAnnouncement }: Props) => {
  const [upcoming, setUpcoming] = useState<UpcomingDate[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    const fetchUpcoming = async () => {
      const today = new Date();
      const inSevenDays = new Date(today);
      inSevenDays.setDate(inSevenDays.getDate() + 7);

      const todayStr = today.toISOString().split("T")[0];
      const futureStr = inSevenDays.toISOString().split("T")[0];

      const { data, error } = await (supabase as any)
        .from("holiday_themes")
        .select("*")
        .gte("holiday_date", todayStr)
        .lte("holiday_date", futureStr)
        .order("holiday_date", { ascending: true });

      if (!error && data) {
        const withDays = data.map((item: HolidayTheme) => {
          const diff = Math.ceil(
            (new Date(item.holiday_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
          );
          return { ...item, days_until: diff };
        });
        setUpcoming(withDays);
      }
    };

    fetchUpcoming();
  }, []);

  const visibleDates = upcoming.filter((d) => !dismissed.includes(d.id));

  if (visibleDates.length === 0) return null;

  return (
    <div className="mb-6 space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <CalendarClock className="w-4 h-4 text-accent" />
        <h3 className="font-display text-sm font-semibold text-foreground">
          Datas Comemorativas Chegando
        </h3>
      </div>

      {visibleDates.map((item) => (
        <div
          key={item.id}
          className={`glass rounded-xl p-4 border-l-4 transition-all ${
            item.is_professional_date
              ? "border-l-accent"
              : "border-l-primary"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{item.emoji}</span>
                <p className="font-display font-semibold text-sm text-foreground truncate">
                  {item.name}
                </p>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium whitespace-nowrap">
                  {item.days_until === 0
                    ? "Hoje!"
                    : item.days_until === 1
                    ? "Amanhã"
                    : `em ${item.days_until} dias`}
                </span>
              </div>

              {item.description && (
                <p className="text-xs text-muted-foreground mb-2">{item.description}</p>
              )}

              {/* Action suggestions */}
              <div className="flex flex-wrap gap-2 mt-2">
                <div className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg bg-secondary/50 text-muted-foreground">
                  <Palette className="w-3 h-3" />
                  <span>Ativar tema no painel de Temas</span>
                </div>

                {item.is_professional_date && (
                  <div className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg bg-accent/10 text-accent">
                    <MessageSquarePlus className="w-3 h-3" />
                    <span>Criar aviso com mensagem especial</span>
                  </div>
                )}
              </div>

              {/* Suggested message for professional dates */}
              {item.is_professional_date && item.suggested_message && (
                <div className="mt-3 p-3 rounded-lg bg-secondary/30 border border-border/50">
                  <p className="text-[10px] font-medium text-muted-foreground mb-1">
                    💡 Sugestão de mensagem:
                  </p>
                  <p className="text-xs text-foreground/80 italic leading-relaxed">
                    "{item.suggested_message}"
                  </p>
                  {onCreateAnnouncement && (
                    <button
                      onClick={() =>
                        onCreateAnnouncement(
                          `${item.emoji} ${item.name}`,
                          item.suggested_message || ""
                        )
                      }
                      className="mt-2 menu-btn flex items-center gap-1.5 text-xs !py-1.5 !px-3"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      Criar Aviso com esta mensagem
                    </button>
                  )}
                </div>
              )}

              {/* Image bank suggestion */}
              {item.is_professional_date && item.image_bank_url && (
                <a
                  href={item.image_bank_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-[10px] text-primary hover:text-primary/80 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  Buscar imagens gratuitas no Unsplash
                </a>
              )}
            </div>

            <button
              onClick={() => setDismissed((prev) => [...prev, item.id])}
              className="p-1 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
              title="Dispensar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UpcomingDatesAlert;
