import FlowFieldBackground from "@/components/FlowFieldBackground";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import AnnouncementPopup from "@/components/AnnouncementPopup";
import BirthdayPopup from "@/components/BirthdayPopup";
import BirthdaySidebar from "@/components/BirthdaySidebar";
import WeatherCard from "@/components/WeatherCard";
import NewsCarousel from "@/components/NewsCarousel";
import QuickLinks from "@/components/QuickLinks";
import NewsFeed from "@/components/NewsFeed";
import GallerySection from "@/components/GallerySection";

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

        {/* News Carousel — below hero title */}
        <NewsCarousel />

        {/* Quick Links */}
        <QuickLinks />

        {/* Weather + Birthday sidebar row */}
        <section className="max-w-6xl mx-auto px-6 pb-16 flex flex-col lg:flex-row gap-6 items-start">
          {/* Weather card — left */}
          <WeatherCard />

          {/* Center spacer */}
          <div className="flex-1" />

          {/* Birthday sidebar — right */}
          <BirthdaySidebar />
        </section>

        {/* Fique por dentro — News feed */}
        <NewsFeed />

        {/* Gallery */}
        <GallerySection />

        {/* Footer */}
        <footer className="relative text-center py-8 text-xs text-muted-foreground" style={{ zIndex: 1 }}>
          © 2026 INWISEPRO — Intranet Corporativa
        </footer>
      </main>
    </div>
  );
};

export default Index;
