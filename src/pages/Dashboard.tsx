import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import FlowFieldBackground from "@/components/FlowFieldBackground";
import DashboardSidebar from "@/components/admin/DashboardSidebar";
import UpcomingDatesAlert from "@/components/admin/UpcomingDatesAlert";
import NewsManager from "@/components/admin/NewsManager";
import AnnouncementsManager from "@/components/admin/AnnouncementsManager";
import BirthdaysManager from "@/components/admin/BirthdaysManager";
import GalleryManager from "@/components/admin/GalleryManager";
import HolidayThemesManager from "@/components/admin/HolidayThemesManager";
import MenuLinksManager from "@/components/admin/MenuLinksManager";
import SiteSettingsManager from "@/components/admin/SiteSettingsManager";

const sectionComponents: Record<string, React.FC> = {
  news: NewsManager,
  announcements: AnnouncementsManager,
  birthdays: BirthdaysManager,
  gallery: GalleryManager,
  themes: HolidayThemesManager,
  "menu-links": MenuLinksManager,
  settings: SiteSettingsManager,
};

const Dashboard = () => {
  const { role } = useAuth();
  const [activeSection, setActiveSection] = useState("news");

  const ActiveComponent = sectionComponents[activeSection];

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
          <UpcomingDatesAlert />

          {/* Active Section */}
          {ActiveComponent ? <ActiveComponent /> : null}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
