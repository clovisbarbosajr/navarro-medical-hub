const HeroSection = () => {
  return (
    <section className="flex flex-col items-center justify-center text-center pt-40 pb-20 px-6 relative" style={{ zIndex: 1 }}>
      <h1 className="font-display text-5xl md:text-7xl font-bold text-foreground animate-fade-slide-up leading-tight">
        Intranet{" "}
        <span className="text-primary">Navarro Medical</span>
      </h1>
      <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl animate-fade-slide-up-delay">
        Central de sistemas, avisos e ferramentas
      </p>
      <div className="mt-8 w-24 h-1 rounded-full bg-gradient-to-r from-primary to-accent animate-fade-slide-up-delay" />
    </section>
  );
};

export default HeroSection;
