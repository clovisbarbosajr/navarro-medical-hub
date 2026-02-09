import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface NewsRow {
  id: string;
  title: string;
  excerpt: string | null;
  image_url: string | null;
  category: string;
  published_at: string;
}

const NewsFeed = () => {
  const [articles, setArticles] = useState<NewsRow[]>([]);

  useEffect(() => {
    const fetchNews = async () => {
      const { data } = await (supabase as any)
        .from("news")
        .select("id, title, excerpt, image_url, category, published_at")
        .order("published_at", { ascending: false })
        .limit(6);
      if (data) setArticles(data);
    };
    fetchNews();
  }, []);

  if (articles.length === 0) return null;

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-foreground mb-5">
        📰 Fique por dentro:
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        {articles.map((article) => (
          <div
            key={article.id}
            className="group glass rounded-xl overflow-hidden hover:scale-[1.02] transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 cursor-pointer flex flex-row h-28"
          >
            {article.image_url && (
              <div className="w-28 flex-shrink-0 overflow-hidden">
                <img
                  src={article.image_url}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
            )}
            <div className="p-3 flex flex-col justify-center min-w-0">
              <span className="inline-block text-[9px] font-semibold uppercase tracking-wider text-accent-foreground bg-accent/20 px-1.5 py-0.5 rounded-full mb-1 w-fit">
                {article.category}
              </span>
              <h4 className="font-display font-semibold text-xs text-foreground mb-1 line-clamp-2">
                {article.title}
              </h4>
              <span className="inline-flex items-center gap-1 text-[9px] text-muted-foreground">
                <Clock className="w-2.5 h-2.5" />
                {format(new Date(article.published_at), "dd MMM yyyy", { locale: ptBR })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsFeed;
