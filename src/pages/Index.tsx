import FlowFieldBackground from "@/components/FlowFieldBackground";
import Header from "@/components/Header";
import AnnouncementPopup from "@/components/AnnouncementPopup";
import BirthdayPopup from "@/components/BirthdayPopup";
import BirthdaySidebar from "@/components/BirthdaySidebar";
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
        {/* Hero title — single line, centered */}
        <section className="max-w-6xl mx-auto px-6 pt-32 pb-8 text-center">
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground animate-fade-slide-up leading-tight whitespace-nowrap">
            Intranet{" "}
            <span className="text-primary">Navarro Medical</span>
          </h1>
          <div className="mt-6 w-24 h-1 rounded-full bg-gradient-to-r from-primary to-accent animate-fade-slide-up-delay mx-auto" />
        </section>

        {/* Two columns: NewsFeed LEFT + Birthdays RIGHT */}
        <section className="max-w-6xl mx-auto px-6 pb-10 flex flex-col lg:flex-row gap-6 items-start">
          <div className="flex-1 min-w-0">
            <NewsFeed />
          </div>
          <div className="w-full lg:w-72 flex-shrink-0">
            <BirthdaySidebar />
          </div>
        </section>

        {/* Carousel — Avisos & Campanhas */}
        <NewsCarousel />

        {/* Quick Links — last */}
        <QuickLinks />

        {/* Footer */}
        <footer className="relative text-center py-8 text-xs text-muted-foreground" style={{ zIndex: 1 }}>
          © 2026 INWISEPRO — Intranet Corporativa
        </footer>
      </main>
    </div>
  );
};

export default Index;
