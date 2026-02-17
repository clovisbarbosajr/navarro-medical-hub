import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Newspaper, Bell, Cake, Image, Palette, Link2, Settings, LogOut, ChevronRight, ChevronDown, ScrollText, Globe, CalendarDays, MessageCircle, Users, Send, Building2 } from "lucide-react";
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
];

const chatSubItems: SidebarItem[] = [
  { id: "chat-users", label: "Usuários", icon: Users, roles: ["admin"] },
  { id: "chat-departments", label: "Departamentos", icon: Building2, roles: ["admin"] },
  { id: "chat-history", label: "Histórico", icon: MessageCircle, roles: ["admin"] },
  { id: "chat-broadcast", label: "Broadcast", icon: Send, roles: ["admin"] },
];

interface DashboardSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const DashboardSidebar = ({ activeSection, onSectionChange }: DashboardSidebarProps) => {
  const { role, logout } = useAuth();
  const isChatActive = activeSection.startsWith("chat-");
  const [chatOpen, setChatOpen] = useState(isChatActive);

  const filteredItems = sidebarItems.filter(
    (item) => role && item.roles.includes(role)
  );

  const showChat = role === "admin";

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

        {/* Chat dropdown section */}
        {showChat && (
          <div className="pt-2 mt-2 border-t border-border/20">
            <button
              onClick={() => setChatOpen(!chatOpen)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isChatActive
                  ? "bg-primary/15 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              <MessageCircle className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 text-left">Chat</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${chatOpen ? "rotate-180" : ""}`} />
            </button>
            {chatOpen && (
              <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-primary/20 pl-3">
                {chatSubItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onSectionChange(item.id)}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-primary/15 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="flex-1 text-left">{item.label}</span>
                      {isActive && <ChevronRight className="w-3 h-3" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

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
