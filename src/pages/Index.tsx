import FlowFieldBackground from "@/components/FlowFieldBackground";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import AnnouncementPopup from "@/components/AnnouncementPopup";
import BirthdayPopup from "@/components/BirthdayPopup";
import BirthdaySidebar from "@/components/BirthdaySidebar";
import WeatherCard from "@/components/WeatherCard";
import QuickLinks from "@/components/QuickLinks";
import NewsFeed from "@/components/NewsFeed";
import NewsCarousel from "@/components/NewsCarousel";

const Index = () => {
  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <FlowFieldBackground />
      <Header />
      <AnnouncementPopup />
      <BirthdayPopup />

      <main className="relative" style={{ zIndex: 1 }}>
        {/* Hero + right sidebar (weather + birthdays) */}
        <section className="max-w-6xl mx-auto px-6 pt-32 pb-10 flex flex-col lg:flex-row gap-8 items-start">
          {/* Left: Hero title */}
          <div className="flex-1 text-center lg:text-left pt-8">
            <h1 className="font-display text-5xl md:text-7xl font-bold text-foreground animate-fade-slide-up leading-tight">
              Intranet{" "}
              <span className="text-primary">Navarro Medical</span>
            </h1>
            <div className="mt-6 w-24 h-1 rounded-full bg-gradient-to-r from-primary to-accent animate-fade-slide-up-delay mx-auto lg:mx-0" />
          </div>

          {/* Right: Weather + Birthdays stacked */}
          <div className="flex flex-col gap-4 w-full lg:w-auto flex-shrink-0 items-center lg:items-end">
            <WeatherCard />
            <BirthdaySidebar />
          </div>
        </section>

        {/* Quick Links — compact */}
        <QuickLinks />

        {/* Fique por dentro — news articles */}
        <NewsFeed />

        {/* News Carousel — at the bottom, compact */}
        <NewsCarousel />

        {/* Footer */}
        <footer className="relative text-center py-8 text-xs text-muted-foreground" style={{ zIndex: 1 }}>
          © 2026 INWISEPRO — Intranet Corporativa
        </footer>
      </main>
    </div>
  );
};

export default Index;
