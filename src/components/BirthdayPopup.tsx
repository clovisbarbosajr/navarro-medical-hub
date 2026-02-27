import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const CONFETTI_COLORS = ["#ff6b6b", "#ffd93d", "#6bcb77", "#4d96ff", "#ff6bcb", "#00d2ff"];

const Confetti = () => {
  const pieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 2,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    size: 6 + Math.random() * 8,
    rotation: Math.random() * 360,
  }));

  return (
    <>
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            backgroundColor: p.color,
            width: p.size,
            height: p.size * 0.6,
            borderRadius: "2px",
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
    </>
  );
};

const BirthdayPopup = () => {
  const [visible, setVisible] = useState(false);
  const [people, setPeople] = useState<{ name: string; photo_url: string | null }[]>([]);

  useEffect(() => {

    const fetchBirthdays = async () => {
      const today = new Date();
      const month = today.getMonth() + 1;
      const day = today.getDate();

      const { data, error } = await (supabase as any)
        .from("birthdays")
        .select("name, photo_url, birth_date");

      if (!error && data) {
        const matches = data.filter((b: any) => {
          const d = new Date(b.birth_date + "T00:00:00");
          return d.getMonth() + 1 === month && d.getDate() === day;
        });
        if (matches.length > 0) {
          setPeople(matches);
          setVisible(true);
        }
      }
    };
    fetchBirthdays();
  }, []);

  const handleClose = () => {
    setVisible(false);
  };

  if (!visible || people.length === 0) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 70 }}>
      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
      <Confetti />
      <div className="relative glass-strong rounded-3xl p-10 max-w-md w-full text-center shadow-2xl animate-fade-slide-up">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors text-lg"
        >
          ×
        </button>
        <p className="text-4xl mb-4">🎉</p>
        <h2 className="font-display text-2xl font-bold text-foreground mb-6">
          Feliz Aniversário!
        </h2>

        <div className="flex items-center justify-center gap-6 flex-wrap mb-4">
          {people.map((person) => (
            <div key={person.name} className="flex flex-col items-center gap-2">
              {person.photo_url && (
                <img
                  src={person.photo_url}
                  alt={person.name}
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-accent/40 shadow-lg"
                />
              )}
              <p className="text-accent font-semibold text-sm">{person.name}</p>
            </div>
          ))}
        </div>

        <p className="text-muted-foreground text-sm">
          Desejamos muita saúde e felicidades! 🎂
        </p>
      </div>
    </div>
  );
};

export default BirthdayPopup;
