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
  const [person, setPerson] = useState<{ name: string; photo_url: string | null } | null>(null);

  useEffect(() => {
    const fetchBirthday = async () => {
      const today = new Date();
      const month = today.getMonth() + 1;
      const day = today.getDate();

      // Find someone whose birth_date has today's month and day
      const { data, error } = await (supabase as any)
        .from("birthdays")
        .select("name, photo_url, birth_date");

      if (!error && data) {
        const match = data.find((b: any) => {
          const d = new Date(b.birth_date + "T00:00:00");
          return d.getMonth() + 1 === month && d.getDate() === day;
        });
        if (match) {
          setPerson(match);
          setVisible(true);
        }
      }
    };
    fetchBirthday();
  }, []);

  const handleClose = () => {
    setVisible(false);
  };

  if (!visible || !person) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 70 }}>
      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
      <Confetti />
      <div className="relative glass-strong rounded-3xl p-10 max-w-sm w-full text-center shadow-2xl animate-fade-slide-up">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors text-lg"
        >
          ×
        </button>
        {person.photo_url && (
          <img
            src={person.photo_url}
            alt={person.name}
            className="w-28 h-28 rounded-full mx-auto mb-6 object-cover ring-4 ring-accent/40 shadow-lg"
          />
        )}
        <p className="text-4xl mb-3">🎉</p>
        <h2 className="font-display text-2xl font-bold text-foreground mb-2">
          Happy Birthday!
        </h2>
        <p className="text-accent font-semibold text-lg mb-1">{person.name}</p>
        <p className="text-muted-foreground text-sm">
          Desejamos muita saúde e felicidades! 🎂
        </p>
      </div>
    </div>
  );
};

export default BirthdayPopup;
