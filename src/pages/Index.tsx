import FlowFieldBackground from "@/components/FlowFieldBackground";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import AnnouncementPopup from "@/components/AnnouncementPopup";
import BirthdayPopup from "@/components/BirthdayPopup";
import BirthdaySidebar from "@/components/BirthdaySidebar";
import WeatherCard from "@/components/WeatherCard";
import Gallery from "@/components/Gallery";

const Index = () => {
  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Animated flow field background */}
      <FlowFieldBackground />

      {/* Fixed header */}
      <Header />

      {/* Popups */}
      <AnnouncementPopup />
      <BirthdayPopup />

      {/* Main content */}
      <main className="relative" style={{ zIndex: 1 }}>
        <HeroSection />

        {/* Sidebar + Weather row */}
        <section className="max-w-6xl mx-auto px-6 pb-16 flex flex-col lg:flex-row gap-6 items-start">
          {/* Birthday sidebar - always visible */}
          <BirthdaySidebar />

          {/* Center spacer */}
          <div className="flex-1" />

          {/* Weather card */}
          <WeatherCard />
        </section>

        {/* Gallery */}
        <Gallery />

        {/* Footer */}
        <footer className="relative text-center py-8 text-xs text-muted-foreground" style={{ zIndex: 1 }}>
          © {new Date().getFullYear()} Navarro Medical — Intranet Corporativa
        </footer>
      </main>
    </div>
  );
};

export default Index;
