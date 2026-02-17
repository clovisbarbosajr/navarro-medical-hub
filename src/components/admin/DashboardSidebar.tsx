import { useAuth } from "@/contexts/AuthContext";
import { Newspaper, Bell, Cake, Image, Palette, Link2, Settings, LogOut, ChevronRight, ScrollText, Globe, CalendarDays, MessageCircle, Users, Send, Building2 } from "lucide-react";
import type { AppRole } from "@/types/database";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ElementType;
  roles: AppRole[];
}

const sidebarItems: SidebarItem[] = [
  { id: "news", label: "Notícias", icon: Newspaper, roles: ["admin", "manager"] },
  { id: "announcements", label: "Avisos", icon: Bell, roles: ["admin", "manager"] },
  { id: "birthdays", label: "Aniversariantes", icon: Cake, roles: ["admin", "manager"] },
  { id: "gallery", label: "Campanhas", icon: Image, roles: ["admin", "manager"] },
  { id: "events", label: "Eventos", icon: CalendarDays, roles: ["admin", "manager"] },
  { id: "themes", label: "Temas", icon: Palette, roles: ["admin", "manager"] },
  { id: "menu-links", label: "Menu & Links", icon: Link2, roles: ["admin", "manager"] },
  { id: "settings", label: "Configurações", icon: Settings, roles: ["admin"] },
  { id: "audit-log", label: "Log de Atividades", icon: ScrollText, roles: ["admin"] },
  { id: "access-logs", label: "Acessos & IPs", icon: Globe, roles: ["admin"] },
  { id: "chat-users", label: "Chat — Usuários", icon: Users, roles: ["admin"] },
  { id: "chat-departments", label: "Chat — Departamentos", icon: Building2, roles: ["admin"] },
  { id: "chat-history", label: "Chat — Histórico", icon: MessageCircle, roles: ["admin"] },
  { id: "chat-broadcast", label: "Chat — Broadcast", icon: Send, roles: ["admin"] },
];

interface DashboardSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const DashboardSidebar = ({ activeSection, onSectionChange }: DashboardSidebarProps) => {
  const { role, logout } = useAuth();

  const filteredItems = sidebarItems.filter(
    (item) => role && item.roles.includes(role)
  );

  return (
    <aside className="w-64 min-h-screen glass-strong border-r border-border/30 flex flex-col" style={{ zIndex: 2 }}>
      {/* Header */}
      <div className="p-5 border-b border-border/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center font-display font-bold text-primary-foreground text-sm">
            N
          </div>
          <div>
            <p className="font-display font-bold text-sm text-foreground">Painel Admin</p>
            <p className="text-xs text-primary font-medium capitalize">{role}</p>
          </div>
        </div>
      </div>

      {/* Navigation + Actions */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-primary/15 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 text-left">{item.label}</span>
              {isActive && <ChevronRight className="w-3 h-3" />}
            </button>
          );
        })}

        {/* Voltar + Sair right after last menu item */}
        <div className="pt-3 mt-3 border-t border-border/20 space-y-1">
          <a
            href="/"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
          >
            ← Voltar à Intranet
          </a>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default DashboardSidebar;
