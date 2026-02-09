import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Birthday } from "@/types/database";

const BirthdaySidebar = () => {
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const currentMonth = new Date().toLocaleDateString("pt-BR", { month: "long" });
  const month = new Date().getMonth() + 1;

  useEffect(() => {
    const fetchBirthdays = async () => {
      const { data } = await (supabase as any)
        .from("birthdays")
        .select("*")
        .order("birth_date", { ascending: true });
      if (data) {
        // Filter to current month
        const filtered = data.filter((b: Birthday) => {
          const d = new Date(b.birth_date + "T00:00:00");
          return d.getMonth() + 1 === month;
        });
        setBirthdays(filtered);
      }
    };
    fetchBirthdays();
  }, [month]);

  if (birthdays.length === 0) return null;

  return (
    <div className="glass-strong rounded-2xl p-4 md:p-5 w-full lg:w-72 max-h-[360px] md:max-h-[480px] flex flex-col" style={{ zIndex: 1 }}>
      <h3 className="font-display font-bold text-foreground text-base mb-4 flex items-center gap-2">
        🎂 Aniversariantes — <span className="capitalize">{currentMonth}</span>
      </h3>
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {birthdays.map((person) => {
          const day = new Date(person.birth_date + "T00:00:00").getDate();
          return (
            <div
              key={person.id}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-secondary/50 transition-colors"
            >
              {person.photo_url ? (
                <img
                  src={person.photo_url}
                  alt={person.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-accent/40"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary ring-2 ring-accent/40">
                  {person.name.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{person.name}</p>
                <p className="text-xs text-muted-foreground">Dia {day}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BirthdaySidebar;
