import FlowFieldBackground from "@/components/FlowFieldBackground";
import ThemedBackground from "@/components/ThemedBackground";
import Header from "@/components/Header";
import AnnouncementPopup from "@/components/AnnouncementPopup";
import BirthdayPopup from "@/components/BirthdayPopup";
import BirthdaySidebar from "@/components/BirthdaySidebar";
import QuickLinks from "@/components/QuickLinks";
import NewsFeed from "@/components/NewsFeed";
import NewsCarousel from "@/components/NewsCarousel";
import GallerySection from "@/components/GallerySection";
import useActiveTheme from "@/hooks/useActiveTheme";
import navarroLogo from "@/assets/navarro-heart-logo.png";

const Index = () => {
  const activeTheme = useActiveTheme();

  return (
    <div className="min-h-screen relative overflow-x-hidden">
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
      <Header />
      <AnnouncementPopup />
      <BirthdayPopup />

      {/* Theme banner */}
      {activeTheme && (
        <div className="fixed top-16 left-0 right-0 text-center py-2 glass-strong animate-fade-slide-up" style={{ zIndex: 49 }}>
          <span className="text-sm font-medium text-foreground">
            {activeTheme.emoji} {activeTheme.name}
            {activeTheme.description && (
              <span className="text-muted-foreground ml-2 text-xs">— {activeTheme.description}</span>
            )}
          </span>
        </div>
      )}

      <main className="relative" style={{ zIndex: 1 }}>
        {/* Hero title */}
        <section className={`max-w-6xl mx-auto px-4 md:px-6 ${activeTheme ? "pt-28 md:pt-40" : "pt-20 md:pt-32"} pb-6 md:pb-8 text-center`}>
          <h1 className="font-display text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-foreground animate-fade-slide-up leading-tight md:whitespace-nowrap flex items-center justify-center gap-3 md:gap-5">
            <img src={navarroLogo} alt="Navarro Medical" className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 inline-block" />
            <span>Intranet{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Navarro Medical</span>
            </span>
          </h1>
          <div className="mt-4 md:mt-6 w-16 md:w-24 h-1 rounded-full bg-gradient-to-r from-primary to-accent animate-fade-slide-up-delay mx-auto" />
        </section>

        {/* Two columns: NewsFeed LEFT + Birthdays RIGHT */}
        <section className="max-w-6xl mx-auto px-4 md:px-6 pb-8 md:pb-10 flex flex-col lg:flex-row gap-6 items-start">
          <div className="flex-1 min-w-0">
            <NewsFeed />
          </div>
          <div className="w-full lg:w-72 flex-shrink-0">
            <BirthdaySidebar />
          </div>
        </section>

        {/* Carousel — Avisos & Campanhas */}
        <NewsCarousel />

        {/* Gallery */}
        <GallerySection />

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
