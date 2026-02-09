import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "navarro_announcement_dismissed";

const AnnouncementPopup = () => {
  const [visible, setVisible] = useState(false);
  const [checked, setChecked] = useState(false);
  const [announcement, setAnnouncement] = useState<{ id: string; title: string; body: string } | null>(null);

  useEffect(() => {
    const dismissed = sessionStorage.getItem(STORAGE_KEY);
    if (dismissed) return;

    const fetchAnnouncement = async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await (supabase as any)
        .from("announcements")
        .select("id, title, body")
        .eq("enabled", true)
        .or(`end_date.is.null,end_date.gte.${today}`)
        .order("created_at", { ascending: false })
        .limit(1);

      if (!error && data && data.length > 0) {
        setAnnouncement(data[0]);
        setVisible(true);
      }
    };
    fetchAnnouncement();
  }, []);

  const handleDismiss = () => {
    if (!checked) return;
    sessionStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  };

  if (!visible || !announcement) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 60 }}>
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
      <div className="relative glass-strong rounded-2xl p-8 max-w-lg w-full shadow-2xl animate-fade-slide-up animate-pulse-glow">
        <h2 className="font-display text-xl font-bold text-foreground mb-4">
          {announcement.title}
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed mb-6">
          {announcement.body}
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
