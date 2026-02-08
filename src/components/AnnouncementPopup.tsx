import { useState, useEffect } from "react";

const STORAGE_KEY = "navarro_announcement_dismissed";

// Mock announcement — ready for HumHub integration
const mockAnnouncement = {
  id: "aviso-001",
  title: "⚠️ Manutenção Programada",
  body: "O sistema de prontuário eletrônico ficará indisponível no dia 15/02 das 22h às 06h para manutenção preventiva. Por favor, finalize seus registros antes desse horário.",
  enabled: true,
};

const AnnouncementPopup = () => {
  const [visible, setVisible] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!mockAnnouncement.enabled) return;

    // Show on first load or hard refresh (performance.navigation or navigationType)
    const dismissed = sessionStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      setVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    if (!checked) return;
    sessionStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 60 }}>
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={() => {}} />
      <div className="relative glass-strong rounded-2xl p-8 max-w-lg w-full shadow-2xl animate-fade-slide-up animate-pulse-glow">
        <h2 className="font-display text-xl font-bold text-foreground mb-4">
          {mockAnnouncement.title}
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed mb-6">
          {mockAnnouncement.body}
        </p>

        <div className="flex items-center gap-3 mb-6 checkbox-wrapper">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            id="announcement-check"
          />
          <label htmlFor="announcement-check" className="text-sm text-foreground cursor-pointer select-none">
            Li e estou ciente
          </label>
        </div>

        <button
          onClick={handleDismiss}
          disabled={!checked}
          className={`menu-btn w-full text-center transition-opacity ${!checked ? "opacity-40 cursor-not-allowed" : ""}`}
        >
          Fechar
        </button>
      </div>
    </div>
  );
};

export default AnnouncementPopup;
