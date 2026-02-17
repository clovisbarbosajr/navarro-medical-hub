import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Calendar, FlaskConical, Pill, Stethoscope, HeadsetIcon, BookOpen, Shield, ExternalLink } from "lucide-react";
import IframeOverlay from "@/components/IframeOverlay";
import BudgetAssistantPopup from "@/components/BudgetAssistantPopup";
import type { MenuLink } from "@/types/database";

const ICON_MAP: Record<string, any> = {
  "prontuário": FileText,
  "agendamento": Calendar,
  "laboratório": FlaskConical,
  "farmácia": Pill,
  "calculadora": Stethoscope,
  "protocolo": BookOpen,
  "helpdesk": HeadsetIcon,
  "chamado": HeadsetIcon,
  "documento": Shield,
};

// Dynamic opacity-based cards using theme primary/accent
const OPACITY_CYCLE = [0.25, 0.2, 0.18, 0.22, 0.15, 0.2, 0.17, 0.25];

function getIcon(label: string) {
  const lower = label.toLowerCase();
  for (const [key, Icon] of Object.entries(ICON_MAP)) {
    if (lower.includes(key)) return Icon;
  }
  return ExternalLink;
}

const BUDGET_ASSISTANT_LABEL = "IA NAVARRO";

const QuickLinks = () => {
  const [links, setLinks] = useState<MenuLink[]>([]);
  const [iframeLink, setIframeLink] = useState<MenuLink | null>(null);
  const [budgetOpen, setBudgetOpen] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await (supabase as any)
        .from("menu_links")
        .select("*")
        .order("category", { ascending: true })
        .order("sort_order", { ascending: true });
      if (data) setLinks(data);
    };
    fetch();
  }, []);

  if (links.length === 0) return null;

  const handleClick = (e: React.MouseEvent, link: MenuLink) => {
    if (link.label.toUpperCase().includes(BUDGET_ASSISTANT_LABEL)) {
      e.preventDefault();
      setBudgetOpen(true);
      return;
    }
    if (link.open_mode === "iframe") {
      e.preventDefault();
      setIframeLink(link);
    }
  };

  return (
    <>
      <section className="relative px-4 md:px-6 pb-10" style={{ zIndex: 1 }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-base md:text-lg font-bold text-foreground mb-4 text-center">
            🚀 Links Rápidos
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {links.map((link, i) => {
              const Icon = getIcon(link.label);
              const opacity = OPACITY_CYCLE[i % OPACITY_CYCLE.length];
              const useAccent = i % 2 === 1;
              return (
                <a
                  key={link.id}
                  href={link.href}
                  target={link.open_mode === "new_tab" ? "_blank" : undefined}
                  rel={link.open_mode === "new_tab" ? "noopener noreferrer" : undefined}
                  onClick={(e) => handleClick(e, link)}
                  className="group glass rounded-xl p-3 flex flex-col items-center text-center gap-1.5 hover:scale-[1.05] transition-all duration-300 hover:shadow-md"
                  style={{ boxShadow: `0 0 0 transparent` }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 4px 15px hsla(var(--primary) / 0.15)`)}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = `0 0 0 transparent`)}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                    style={{
                      background: `linear-gradient(135deg, hsla(var(--${useAccent ? 'accent' : 'primary'}) / ${opacity}), hsla(var(--${useAccent ? 'primary' : 'accent'}) / ${opacity * 0.3}))`,
                    }}
                  >
                    <Icon className="w-5 h-5 text-foreground" />
                  </div>
                  <p className="font-display font-semibold text-[10px] text-foreground leading-tight">
                    {link.label}
                  </p>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {iframeLink && (
        <IframeOverlay
          url={iframeLink.href}
          title={iframeLink.label}
          onClose={() => setIframeLink(null)}
        />
      )}

      <BudgetAssistantPopup open={budgetOpen} onClose={() => setBudgetOpen(false)} />
    </>
  );
};

export default QuickLinks;
