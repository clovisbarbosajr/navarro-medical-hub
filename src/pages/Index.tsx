import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, PROCEDURES_ALLOWED_EMAILS } from "@/contexts/AuthContext";
import { useChatAuth } from "@/contexts/ChatAuthContext";
import FloatingClovisFab from "@/components/FloatingClovisFab";
import BudgetAssistantPopup from "@/components/BudgetAssistantPopup";
import FlowFieldBackground from "@/components/FlowFieldBackground";
import ThemedBackground from "@/components/ThemedBackground";
import Header from "@/components/Header";
import AnnouncementPopup from "@/components/AnnouncementPopup";
import BirthdayPopup from "@/components/BirthdayPopup";
import BirthdaySidebar from "@/components/BirthdaySidebar";
import QuickLinks from "@/components/QuickLinks";
import EventsSidebar from "@/components/EventsSidebar";
import NewsFeed from "@/components/NewsFeed";
import NewsCarousel from "@/components/NewsCarousel";
import GallerySection from "@/components/GallerySection";
import useActiveTheme from "@/hooks/useActiveTheme";
import navarroLogo from "@/assets/navarro-heart-logo.png";
import { X, MessageCircle } from "lucide-react";
import chatLogo from "@/assets/chat-logo.png";
import DeniseProceduresManager from "@/components/admin/DeniseProceduresManager";
import RHPaymentsManager from "@/components/admin/RHPaymentsManager";
import ChatWidget from "@/components/chat/ChatWidget";
import { toast } from "sonner";

const Index = () => {
  const { user, role } = useAuth();
  const activeTheme = useActiveTheme();
  const { user: chatUser, profile: chatProfile } = useChatAuth();
  const [blocked, setBlocked] = useState<boolean | null>(null);
  const [clovisOpen, setClovisOpen] = useState(false);
  const [proceduresOpen, setProceduresOpen] = useState(false);
  const [rhOpen, setRHOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const isAdmin = role === "admin";

  useEffect(() => {
    const check = async () => {
      const [maintRes, ipsRes] = await Promise.all([
        (supabase as any).from("site_settings").select("value").eq("key", "maintenance_mode").single(),
        (supabase as any).from("site_settings").select("value").eq("key", "allowed_ips").single(),
      ]);

      const maintenanceOn = maintRes.data?.value === "true";
      const allowedIps = (ipsRes.data?.value || "").split(",").map((ip: string) => ip.trim()).filter(Boolean);

      if (!maintenanceOn && allowedIps.length === 0) {
        setBlocked(false);
        return;
      }

      if (maintenanceOn && allowedIps.length === 0) {
        setBlocked(true);
        return;
      }

      if (allowedIps.length > 0) {
        try {
          const res = await fetch("https://api.ipify.org?format=json");
          const { ip } = await res.json();
          setBlocked(!allowedIps.includes(ip));
        } catch {
          setBlocked(false);
        }
        return;
      }

      setBlocked(false);
    };
    check();
  }, []);

  // Lock body scroll when overlay is open
  useEffect(() => {
    if (proceduresOpen || rhOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [proceduresOpen, rhOpen]);

  // Log access via edge function
  useEffect(() => {
    if (blocked === false) {
      fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/log-access`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ path: window.location.pathname }),
      }).catch(() => {});

      // Register service worker for push notifications
      if ("serviceWorker" in navigator && "PushManager" in window) {
        navigator.serviceWorker.register("/sw-push.js").catch(() => {});
      }
    }
  }, [blocked]);


  if (blocked === null) return null;

  if (blocked) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        <FlowFieldBackground />

        {/* Decorative gradient orbs */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-32 w-80 h-80 rounded-full bg-accent/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center px-6 max-w-xl">
          <div className="glass-strong rounded-3xl p-10 sm:p-14 shadow-2xl border border-border/30">
            {/* Logo */}
            <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-8">
              <img src={navarroLogo} alt="Navarro Medical" className="w-14 h-14 object-contain" />
            </div>

            {/* Shield icon */}
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>

            {/* Portuguese */}
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Acesso Restrito
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Por segurança e proteção dos dados, esta página só é acessível de dentro da empresa.
            </p>

            {/* Divider */}
            <div className="w-16 h-px bg-border mx-auto mb-6" />

            {/* English */}
            <h2 className="font-display text-lg sm:text-xl font-semibold text-foreground/80 mb-2">
              Restricted Access
            </h2>
            <p className="text-muted-foreground/80 text-xs leading-relaxed mb-8">
              For security and data protection, this page is only accessible from within the company network.
            </p>

            {/* Gradient bar */}
            <div className="w-20 h-1 rounded-full bg-gradient-to-r from-primary to-accent mx-auto mb-6" />

            {/* Footer */}
            <p className="text-xs text-muted-foreground/60">
              Navarro Medical Group — Intranet Corporativa
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {activeTheme?.background_image_url ? (
        <div
          className="fixed inset-0 w-full h-full pointer-events-none bg-cover bg-center bg-no-repeat opacity-15"
          style={{ zIndex: 0, backgroundImage: `url(${activeTheme.background_image_url})` }}
        />
      ) : activeTheme?.background_type ? (
        <ThemedBackground type={activeTheme.background_type} />
      ) : (
        <FlowFieldBackground />
      )}
      <Header
        onOpenProcedures={user && PROCEDURES_ALLOWED_EMAILS.includes(user.email || "") ? () => setProceduresOpen(true) : undefined}
        onOpenRH={user && PROCEDURES_ALLOWED_EMAILS.includes(user.email || "") ? () => setRHOpen(true) : undefined}
      />
      <AnnouncementPopup />
      <BirthdayPopup />

      {activeTheme && (
        <div className="fixed top-16 left-0 right-0 text-center py-2 glass-strong animate-fade-slide-up" style={{ zIndex: 49 }}>
          <span className="text-sm font-medium text-foreground">
            {activeTheme.emoji} {activeTheme.name}
            {activeTheme.description && (
              <span className="text-muted-foreground ml-2 text-xs">— {activeTheme.description}</span>
            )}
          </span>
        </div>
      )}

      <main className="relative" style={{ zIndex: 1 }}>
        <section className={`max-w-6xl mx-auto px-4 md:px-6 ${activeTheme ? "pt-28 md:pt-40" : "pt-20 md:pt-32"} pb-6 md:pb-8 text-center`}>
          <h1 className="font-display text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-foreground animate-fade-slide-up leading-tight md:whitespace-nowrap flex items-center justify-center gap-3 md:gap-5">
            <img src={navarroLogo} alt="Navarro Medical" className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 inline-block" />
            <span>Intranet{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Navarro Medical</span>
            </span>
          </h1>
          <div className="mt-4 md:mt-6 w-16 md:w-24 h-1 rounded-full bg-gradient-to-r from-primary to-accent animate-fade-slide-up-delay mx-auto" />
        </section>

        <section className="max-w-6xl mx-auto px-4 md:px-6 pb-8 md:pb-10 flex flex-col lg:flex-row gap-6 items-start">
          <div className="flex-1 min-w-0">
            <NewsFeed />
          </div>
          <div className="w-full lg:w-72 flex-shrink-0 space-y-6">
            <BirthdaySidebar />
            <EventsSidebar />
          </div>
        </section>

        <NewsCarousel />
        <GallerySection />
        <QuickLinks />

        <footer className="relative text-center py-8 text-xs text-muted-foreground" style={{ zIndex: 1 }}>
          © 2026 INWISEPRO — Intranet Corporativa
        </footer>
      </main>

      <FloatingClovisFab onClick={() => setClovisOpen(true)} />
      <BudgetAssistantPopup open={clovisOpen} onClose={() => setClovisOpen(false)} />

      {/* Chat FAB — only visible when logged in */}
      {user && !chatOpen && (
        <button
          onClick={() => {
            if (isAdmin) {
              setChatOpen(true);
            } else {
              toast.info("🚧 Navarro Connect — Em breve!", {
                description: "O chat corporativo estará disponível em breve para todos os colaboradores.",
              });
            }
          }}
          style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem' }}
          className="z-50 w-[4.5rem] h-[4.5rem] rounded-2xl shadow-lg hover:scale-105 transition-transform flex items-center justify-center overflow-hidden p-2 border-0 bg-white/80 backdrop-blur-sm"
          title="Navarro Connect"
        >
          <img src={chatLogo} alt="Chat" className="w-full h-full object-contain rounded-lg" />
        </button>
      )}
      {chatOpen && isAdmin && <ChatWidget />}



      {/* Procedures fullscreen overlay */}
      {proceduresOpen && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-sm" style={{ zIndex: 100 }}>
          <div className="h-full overflow-y-auto custom-overlay-scroll">
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => setProceduresOpen(false)}
                  className="p-2 rounded-xl hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <DeniseProceduresManager />
            </div>
          </div>
        </div>
      )}

      {/* RH Payments fullscreen overlay */}
      {rhOpen && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-sm" style={{ zIndex: 100 }}>
          <div className="h-full overflow-y-auto custom-overlay-scroll">
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => setRHOpen(false)}
                  className="p-2 rounded-xl hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <RHPaymentsManager />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;