import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import FlowFieldBackground from "@/components/FlowFieldBackground";
import BudgetAssistantPopup from "@/components/BudgetAssistantPopup";
import DashboardSidebar from "@/components/admin/DashboardSidebar";
import UpcomingDatesAlert from "@/components/admin/UpcomingDatesAlert";
import NewsManager from "@/components/admin/NewsManager";
import AuditLogViewer from "@/components/admin/AuditLogViewer";
import AnnouncementsManager from "@/components/admin/AnnouncementsManager";
import BirthdaysManager from "@/components/admin/BirthdaysManager";
import GalleryManager from "@/components/admin/GalleryManager";
import HolidayThemesManager from "@/components/admin/HolidayThemesManager";
import MenuLinksManager from "@/components/admin/MenuLinksManager";
import SiteSettingsManager from "@/components/admin/SiteSettingsManager";

interface AnnouncementPrefill {
  title: string;
  body: string;
}

const Dashboard = () => {
  const { role } = useAuth();
  const [activeSection, setActiveSection] = useState("news");
  const [announcementPrefill, setAnnouncementPrefill] = useState<AnnouncementPrefill | null>(null);
  const [clovisOpen, setClovisOpen] = useState(false);

  const handleCreateAnnouncement = (title: string, body: string) => {
    setAnnouncementPrefill({ title, body });
    setActiveSection("announcements");
  };

  const renderSection = () => {
    switch (activeSection) {
      case "news": return <NewsManager />;
      case "announcements": return (
        <AnnouncementsManager
          prefill={announcementPrefill}
          onPrefillConsumed={() => setAnnouncementPrefill(null)}
        />
      );
      case "birthdays": return <BirthdaysManager />;
      case "gallery": return <GalleryManager />;
      case "themes": return <HolidayThemesManager />;
      case "menu-links": return <MenuLinksManager />;
      case "settings": return <SiteSettingsManager />;
      case "audit-log": return <AuditLogViewer />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex">
      <FlowFieldBackground />

      <DashboardSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      <main className="flex-1 overflow-y-auto relative" style={{ zIndex: 1 }}>
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-2xl font-bold text-foreground">
              Painel de Controle
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {role === "admin"
                ? "Acesso completo — gerencie todos os conteúdos e configurações."
                : "Gerencie notícias, avisos, aniversariantes, campanhas e temas."}
            </p>
          </div>

          {/* Upcoming Dates Alert */}
          <UpcomingDatesAlert onCreateAnnouncement={handleCreateAnnouncement} />

          {/* Active Section */}
          {renderSection()}
        </div>
      </main>

      {/* Clovis FAB */}
      <button
        onClick={() => setClovisOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 flex items-center justify-center transition-all hover:scale-105 z-50"
        title="Clovis — Assistente de Orçamentos (Modo Admin)"
      >
        <span className="text-2xl">🤖</span>
      </button>

      <BudgetAssistantPopup open={clovisOpen} onClose={() => setClovisOpen(false)} />
    </div>
  );
};

export default Dashboard;
