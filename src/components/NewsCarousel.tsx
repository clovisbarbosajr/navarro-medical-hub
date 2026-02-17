import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface NewsRow {
  id: string;
  title: string;
  excerpt: string | null;
  image_url: string | null;
}

// Opacity variations for visual rhythm using theme colors
const OPACITY_LEVELS = [0.3, 0.25, 0.35, 0.2, 0.28];

const NewsCarousel = () => {
  const [items, setItems] = useState<NewsRow[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const fetchNews = async () => {
      const { data } = await (supabase as any)
        .from("news")
        .select("id, title, excerpt, image_url")
        .order("published_at", { ascending: false })
        .limit(10);
      if (data) setItems(data);
    };
    fetchNews();
  }, []);

  const next = useCallback(() => {
    if (items.length === 0) return;
    setCurrent((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const prev = useCallback(() => {
    if (items.length === 0) return;
    setCurrent((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (items.length === 0) return;
    const interval = setInterval(next, 6000);
    return () => clearInterval(interval);
  }, [next, items.length]);

  if (items.length === 0) return null;

  const item = items[current];
  const opacity = OPACITY_LEVELS[current % OPACITY_LEVELS.length];

  return (
    <section className="relative px-4 md:px-6 pb-8 md:pb-10" style={{ zIndex: 1 }}>
      <div className="max-w-6xl mx-auto">
        <h2 className="font-display text-lg font-bold text-foreground mb-4 text-center">
          📢 Avisos & Campanhas
        </h2>
        <div
          className="relative glass rounded-2xl overflow-hidden transition-all duration-500"
          style={{ background: `linear-gradient(135deg, hsla(var(--primary) / ${opacity}), hsla(var(--accent) / ${opacity * 0.3}))` }}
        >
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {item.image_url && (
              <div className="w-full sm:w-1/3 h-32 sm:h-36 overflow-hidden">
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            )}
            <div className="flex-1 px-5 py-4 sm:pr-12">
              <h3 className="font-display text-base font-bold text-foreground mb-1.5 transition-all duration-300">
                {item.title}
              </h3>
              {item.excerpt && (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.excerpt}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full glass flex items-center justify-center text-foreground hover:text-primary transition-colors"
            aria-label="Notícia anterior"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full glass flex items-center justify-center text-foreground hover:text-primary transition-colors"
            aria-label="Próxima notícia"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <div className="flex justify-center gap-1.5 pb-3">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  i === current
                    ? "bg-primary w-4"
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
