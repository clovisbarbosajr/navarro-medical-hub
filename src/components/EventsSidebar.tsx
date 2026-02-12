import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CalendarDays, MapPin, Clock } from "lucide-react";

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  location: string | null;
  color: string;
}

const EventsSidebar = () => {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data } = await (supabase as any)
        .from("events")
        .select("*")
        .gte("event_date", today)
        .order("event_date", { ascending: true })
        .limit(5);
      if (data) setEvents(data);
    };
    fetchEvents();
  }, []);

  if (events.length === 0) return null;

  return (
    <div className="glass-strong rounded-2xl p-4 md:p-5 w-full lg:w-72" style={{ zIndex: 1 }}>
      <h3 className="font-display font-bold text-foreground text-base mb-4 flex items-center gap-2">
        <CalendarDays className="w-5 h-5 text-primary" /> Próximos Eventos
      </h3>
      <div className="space-y-3">
        {events.map((event) => {
          const date = new Date(event.event_date + "T00:00:00");
          return (
            <div key={event.id} className="flex items-start gap-3 p-2 rounded-xl hover:bg-secondary/50 transition-colors">
              <div
                className="w-10 h-10 rounded-lg flex flex-col items-center justify-center text-white font-bold flex-shrink-0 text-[10px]"
                style={{ backgroundColor: event.color }}
              >
                <span className="uppercase leading-none">
                  {date.toLocaleDateString("pt-BR", { month: "short" })}
                </span>
                <span className="text-sm leading-none">{date.getDate()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{event.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {event.event_time && (
                    <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                      <Clock className="w-3 h-3" /> {event.event_time.slice(0, 5)}
                    </span>
                  )}
                  {event.location && (
                    <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                      <MapPin className="w-3 h-3" /> {event.location}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EventsSidebar;
