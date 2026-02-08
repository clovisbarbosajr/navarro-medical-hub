import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Mock banners — ready for HumHub integration
const banners = [
  {
    title: "🏥 Semana de Segurança do Paciente",
    description: "De 10 a 14 de fevereiro. Participe das atividades e treinamentos.",
    gradient: "from-blue-600/30 to-cyan-500/10",
  },
  {
    title: "💉 Campanha de Vacinação Interna",
    description: "Vacine-se contra a gripe! Posto médico, 8h às 17h.",
    gradient: "from-emerald-600/30 to-green-500/10",
  },
  {
    title: "📋 Novo Protocolo de Higienização",
    description: "Leia o novo protocolo disponível na área de Documentos.",
    gradient: "from-purple-600/30 to-violet-500/10",
  },
  {
    title: "🎓 Inscrições Abertas — Treinamento BLS",
    description: "Curso de Basic Life Support. Vagas limitadas, inscreva-se já!",
    gradient: "from-orange-600/30 to-amber-500/10",
  },
];

const RotatingBanner = () => {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % banners.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(next, 6000);
    return () => clearInterval(interval);
  }, [next]);

  const banner = banners[current];

  return (
    <section className="relative px-6 pb-12" style={{ zIndex: 1 }}>
      <div className="max-w-6xl mx-auto">
        <div
          className={`relative glass rounded-2xl overflow-hidden bg-gradient-to-r ${banner.gradient} transition-all duration-500`}
        >
          <div className="px-8 py-8 md:py-10 text-center">
            <h3 className="font-display text-xl md:text-2xl font-bold text-foreground mb-2 transition-all duration-300">
              {banner.title}
            </h3>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
              {banner.description}
            </p>
          </div>

          {/* Navigation arrows */}
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full glass flex items-center justify-center text-foreground hover:text-primary transition-colors"
            aria-label="Banner anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full glass flex items-center justify-center text-foreground hover:text-primary transition-colors"
            aria-label="Próximo banner"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Dots */}
          <div className="flex justify-center gap-2 pb-4">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === current
                    ? "bg-primary w-6"
                    : "bg-muted-foreground/40 hover:bg-muted-foreground/60"
                }`}
                aria-label={`Ir para banner ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RotatingBanner;
