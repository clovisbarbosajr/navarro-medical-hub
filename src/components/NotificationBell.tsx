import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Bell } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  body: string | null;
  type: string;
  created_at: string;
}

const LAST_SEEN_KEY = "navarro_notif_last_seen";

const NotificationBell = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNotifs = async () => {
      const { data } = await (supabase as any)
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (data) {
        setNotifications(data);
        const lastSeen = localStorage.getItem(LAST_SEEN_KEY);
        if (lastSeen) {
          const count = data.filter(
            (n: Notification) => new Date(n.created_at) > new Date(lastSeen)
          ).length;
          setUnreadCount(count);
        } else {
          setUnreadCount(data.length);
        }
      }
    };
    fetchNotifs();

    // Subscribe to realtime
    const channel = supabase
      .channel("notifications-bell")
      .on(
        "postgres_changes" as any,
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload: any) => {
          setNotifications((prev) => [payload.new, ...prev].slice(0, 20));
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpen = () => {
    setOpen(!open);
    if (!open) {
      localStorage.setItem(LAST_SEEN_KEY, new Date().toISOString());
      setUnreadCount(0);
    }
  };

  const typeEmoji = (type: string) => {
    switch (type) {
      case "announcement": return "📢";
      case "news": return "📰";
      case "birthday": return "🎂";
      default: return "🔔";
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-xl hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-foreground"
        aria-label="Notificações"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 glass-strong rounded-xl shadow-2xl border border-border/30 overflow-hidden animate-fade-slide-up" style={{ zIndex: 100 }}>
          <div className="px-4 py-3 border-b border-border/20">
            <h3 className="font-display font-bold text-sm text-foreground">Notificações</h3>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Nenhuma notificação</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className="px-4 py-3 border-b border-border/10 hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-base mt-0.5">{typeEmoji(n.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{n.title}</p>
                      {n.body && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>
                      )}
                      <p className="text-[10px] text-muted-foreground/60 mt-1">
                        {new Date(n.created_at).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
