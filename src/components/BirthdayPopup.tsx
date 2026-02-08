import { useState, useEffect } from "react";

// Mock — replace with HumHub data
const birthdayPerson = {
  name: "Dra. Mariana Oliveira",
  photo: "https://i.pravatar.cc/200?img=5",
  enabled: true,
};

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

  useEffect(() => {
    if (!birthdayPerson.enabled) return;
    // Show once per session
    const key = "navarro_birthday_popup_shown";
    if (!sessionStorage.getItem(key)) {
      setVisible(true);
    }
  }, []);

  const handleClose = () => {
    sessionStorage.setItem("navarro_birthday_popup_shown", "true");
    setVisible(false);
  };

  if (!visible) return null;

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
        <img
          src={birthdayPerson.photo}
          alt={birthdayPerson.name}
          className="w-28 h-28 rounded-full mx-auto mb-6 object-cover ring-4 ring-primary/40 shadow-lg"
        />
        <p className="text-4xl mb-3">🎉</p>
        <h2 className="font-display text-2xl font-bold text-foreground mb-2">
          Happy Birthday!
        </h2>
        <p className="text-primary font-semibold text-lg mb-1">{birthdayPerson.name}</p>
        <p className="text-muted-foreground text-sm">
          Desejamos muita saúde e felicidades! 🎂
        </p>
      </div>
    </div>
  );
};

export default BirthdayPopup;
