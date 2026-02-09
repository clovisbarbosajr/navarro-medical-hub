import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import WeatherCard from "@/components/WeatherCard";
import type { MenuLink } from "@/types/database";

const CATEGORY_LABELS: Record<string, string> = {
  sistemas: "Sistemas",
  ferramentas: "Ferramentas",
  helpdesk: "Helpdesk",
};

const CATEGORY_ORDER = ["sistemas", "ferramentas", "helpdesk"];

const Header = () => {
  const [links, setLinks] = useState<MenuLink[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await (supabase as any)
        .from("menu_links")
        .select("*")
        .order("sort_order", { ascending: true });
      if (data) setLinks(data);
    };
    fetch();
  }, []);

  // Group by category
  const grouped: Record<string, MenuLink[]> = {};
  links.forEach((l) => {
    if (!grouped[l.category]) grouped[l.category] = [];
    grouped[l.category].push(l);
  });

  const menuItems = CATEGORY_ORDER
    .filter((cat) => grouped[cat]?.length)
    .map((cat) => ({
      label: CATEGORY_LABELS[cat] || cat,
      links: grouped[cat],
    }));

  return (
    <header className="fixed top-0 left-0 right-0 glass-strong" style={{ zIndex: 50 }}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-display font-bold text-primary-foreground text-sm">
            N
          </div>
          <span className="font-display font-bold text-base md:text-lg text-foreground tracking-tight">
            Navarro Medical
          </span>
        </div>

        {/* Menu — desktop only */}
        <nav className="hidden md:flex items-center gap-3">
          {menuItems.map((item) => (
            <div key={item.label} className="nav-dropdown">
              <a href="#" className="menu-btn">
                {item.label}
              </a>
              <div className="dropdown-content glass-strong rounded-xl p-2 shadow-2xl">
                {item.links.map((link) => (
                  <a
                    key={link.id}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="dropdown-item"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Right side: Weather + Login — desktop only */}
        <div className="hidden md:flex items-center gap-4">
          <WeatherCard />
          <a href="/login" className="login-btn">
            Login
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
