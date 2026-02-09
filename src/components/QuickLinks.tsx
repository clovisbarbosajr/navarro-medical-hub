import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Calendar, FlaskConical, Pill, Stethoscope, HeadsetIcon, BookOpen, Shield, ExternalLink } from "lucide-react";
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

const COLOR_CYCLE = [
  "from-blue-500/20 to-blue-600/5",
  "from-emerald-500/20 to-emerald-600/5",
  "from-purple-500/20 to-purple-600/5",
  "from-orange-500/20 to-orange-600/5",
  "from-rose-500/20 to-rose-600/5",
  "from-cyan-500/20 to-cyan-600/5",
  "from-yellow-500/20 to-yellow-600/5",
  "from-indigo-500/20 to-indigo-600/5",
];

function getIcon(label: string) {
  const lower = label.toLowerCase();
  for (const [key, Icon] of Object.entries(ICON_MAP)) {
    if (lower.includes(key)) return Icon;
  }
  return ExternalLink;
}

const QuickLinks = () => {
  const [links, setLinks] = useState<MenuLink[]>([]);

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

  return (
    <section className="relative px-4 md:px-6 pb-10" style={{ zIndex: 1 }}>
      <div className="max-w-5xl mx-auto">
        <h2 className="font-display text-base md:text-lg font-bold text-foreground mb-4 text-center">
          🚀 Links Rápidos
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {links.map((link, i) => {
            const Icon = getIcon(link.label);
            const color = COLOR_CYCLE[i % COLOR_CYCLE.length];
            return (
              <a
                key={link.id}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group glass rounded-xl p-3 flex flex-col items-center text-center gap-1.5 hover:scale-[1.05] transition-all duration-300 hover:shadow-md hover:shadow-primary/10"
              >
                <div
                  className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
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
  );
};

export default QuickLinks;
