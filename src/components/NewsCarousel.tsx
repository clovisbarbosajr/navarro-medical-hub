import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * NEWS CAROUSEL — Carrossel de Notícias
 *
 * INTEGRAÇÃO BACKEND (HumHub):
 * Substituir o array `newsItems` por dados vindos da API.
 * Endpoint sugerido: GET /api/v1/news
 *
 * Estrutura JSON esperada:
 * [
 *   {
 *     "id": 1,
 *     "title": "Título da notícia",
 *     "description": "Texto curto da notícia",
 *     "image": "https://url-da-imagem.jpg",
 *     "gradient": "from-blue-600/30 to-cyan-500/10"
 *   }
 * ]
 *
 * O carrossel adiciona automaticamente novos itens quando
 * o array de dados cresce (novas notícias do admin).
 */
const newsItems = [
  {
    id: 1,
    title: "🏥 Semana de Segurança do Paciente",
    description: "De 10 a 14 de fevereiro. Participe das atividades e treinamentos.",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=400&fit=crop",
    gradient: "from-blue-600/30 to-cyan-500/10",
  },
  {
    id: 2,
    title: "⚠️ Manutenção Programada — Sistemas",
    description: "O sistema de prontuário ficará indisponível dia 15/02 das 22h às 06h.",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop",
    gradient: "from-amber-600/30 to-orange-500/10",
  },
  {
    id: 3,
    title: "💉 Campanha de Vacinação Interna",
    description: "Vacine-se contra a gripe! Posto médico, 8h às 17h.",
    image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=800&h=400&fit=crop",
    gradient: "from-emerald-600/30 to-green-500/10",
  },
  {
    id: 4,
    title: "🎓 Inscrições Abertas — Treinamento BLS",
    description: "Curso de Basic Life Support. Vagas limitadas, inscreva-se já!",
    image: "https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&h=400&fit=crop",
    gradient: "from-purple-600/30 to-violet-500/10",
  },
];

const NewsCarousel = () => {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % newsItems.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + newsItems.length) % newsItems.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(next, 6000);
    return () => clearInterval(interval);
  }, [next]);

  const item = newsItems[current];

  return (
    <section className="relative px-6 pb-12" style={{ zIndex: 1 }}>
      <div className="max-w-6xl mx-auto">
        <div
          className={`relative glass rounded-2xl overflow-hidden bg-gradient-to-r ${item.gradient} transition-all duration-500`}
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Image */}
            <div className="w-full md:w-2/5 h-48 md:h-56 overflow-hidden">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            {/* Content */}
            <div className="flex-1 px-6 py-6 md:py-8 md:pr-14">
              <h3 className="font-display text-xl md:text-2xl font-bold text-foreground mb-3 transition-all duration-300">
                {item.title}
              </h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>

          {/* Navigation arrows */}
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full glass flex items-center justify-center text-foreground hover:text-primary transition-colors"
            aria-label="Notícia anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full glass flex items-center justify-center text-foreground hover:text-primary transition-colors"
            aria-label="Próxima notícia"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Dots */}
          <div className="flex justify-center gap-2 pb-4">
            {newsItems.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === current
                    ? "bg-primary w-6"
                    : "bg-muted-foreground/40 hover:bg-muted-foreground/60"
                }`}
                aria-label={`Ir para notícia ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsCarousel;
