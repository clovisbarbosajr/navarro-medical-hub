import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import FlowFieldBackground from "@/components/FlowFieldBackground";
import ThemedBackground from "@/components/ThemedBackground";
import useActiveTheme from "@/hooks/useActiveTheme";
import BudgetAssistantPopup from "@/components/BudgetAssistantPopup";
import FloatingClovisFab from "@/components/FloatingClovisFab";
import DashboardSidebar from "@/components/admin/DashboardSidebar";
import UpcomingDatesAlert from "@/components/admin/UpcomingDatesAlert";
import NewsManager from "@/components/admin/NewsManager";
import AuditLogViewer from "@/components/admin/AuditLogViewer";
import AnnouncementsManager from "@/components/admin/AnnouncementsManager";
import BirthdaysManager from "@/components/admin/BirthdaysManager";
import GalleryManager from "@/components/admin/GalleryManager";
import AccessLogsViewer from "@/components/admin/AccessLogsViewer";
import EventsManager from "@/components/admin/EventsManager";
import HolidayThemesManager from "@/components/admin/HolidayThemesManager";
import MenuLinksManager from "@/components/admin/MenuLinksManager";
import SiteSettingsManager from "@/components/admin/SiteSettingsManager";


interface AnnouncementPrefill {
  title: string;
  body: string;
}

const Dashboard = () => {
  const { role } = useAuth();
  const activeTheme = useActiveTheme();
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
      case "events": return <EventsManager />;
      case "themes": return <HolidayThemesManager />;
      case "menu-links": return <MenuLinksManager />;
      case "settings": return <SiteSettingsManager />;
      case "audit-log": return <AuditLogViewer />;
      case "access-logs": return <AccessLogsViewer />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex">
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

      {/* Floating Clovis */}
      <FloatingClovisFab onClick={() => setClovisOpen(true)} label="Clovis — Assistente de Orçamentos (Modo Admin)" />

      <BudgetAssistantPopup open={clovisOpen} onClose={() => setClovisOpen(false)} />
    </div>
  );
};

export default Dashboard;
