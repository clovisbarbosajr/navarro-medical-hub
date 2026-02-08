import { CalendarDays, Clock, MapPin } from "lucide-react";

// Mock events — ready for HumHub integration
const events = [
  {
    date: "10 Feb",
    day: "Mon",
    title: "Reunião de Diretoria Clínica",
    time: "9:00 AM",
    location: "Sala de Conferências 1",
    type: "meeting",
  },
  {
    date: "12 Feb",
    day: "Wed",
    title: "Treinamento BLS — Basic Life Support",
    time: "2:00 PM",
    location: "Auditório Principal",
    type: "training",
  },
  {
    date: "14 Feb",
    day: "Fri",
    title: "Campanha de Vacinação (Gripe)",
    time: "8:00 AM – 5:00 PM",
    location: "Posto Médico",
    type: "campaign",
  },
  {
    date: "18 Feb",
    day: "Tue",
    title: "Workshop de Inovação em Saúde",
    time: "10:00 AM",
    location: "Sala de Treinamento B",
    type: "workshop",
  },
  {
    date: "21 Feb",
    day: "Fri",
    title: "Palestra: Saúde Mental no Trabalho",
    time: "3:00 PM",
    location: "Auditório Principal",
    type: "lecture",
  },
  {
    date: "25 Feb",
    day: "Tue",
    title: "Manutenção Programada — Sistemas",
    time: "10:00 PM – 6:00 AM",
    location: "TI / Remoto",
    type: "maintenance",
  },
];

const typeColors: Record<string, string> = {
  meeting: "bg-blue-500/20 text-blue-400",
  training: "bg-emerald-500/20 text-emerald-400",
  campaign: "bg-amber-500/20 text-amber-400",
  workshop: "bg-purple-500/20 text-purple-400",
  lecture: "bg-rose-500/20 text-rose-400",
  maintenance: "bg-red-500/20 text-red-400",
};

const EventsCalendar = () => {
  return (
    <section className="relative px-6 pb-16" style={{ zIndex: 1 }}>
      <div className="max-w-4xl mx-auto">
        <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">
          📅 Calendário de Eventos
        </h2>

        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-[39px] top-0 bottom-0 w-px bg-border/60" />

          <div className="space-y-4">
            {events.map((event, i) => (
              <div key={i} className="flex gap-5 items-start group">
                {/* Date badge */}
                <div className="flex-shrink-0 w-[78px] text-center">
                  <div className="glass rounded-xl px-3 py-2 group-hover:shadow-lg group-hover:shadow-primary/10 transition-all duration-300">
                    <p className="font-display font-bold text-sm text-foreground leading-tight">
                      {event.date}
                    </p>
                    <p className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider">
                      {event.day}
                    </p>
                  </div>
                </div>

                {/* Event card */}
                <div className="flex-1 glass rounded-2xl p-4 hover:scale-[1.01] transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h4 className="font-display font-semibold text-foreground text-sm mb-2">
                        {event.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {event.time}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {event.location}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`flex-shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full ${
                        typeColors[event.type] || "bg-muted text-muted-foreground"
                      }`}
                    >
                      <CalendarDays className="w-3 h-3" />
                      {event.type}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventsCalendar;
