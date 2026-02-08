import { Clock } from "lucide-react";

/**
 * NEWS FEED — "Fique por dentro"
 *
 * INTEGRAÇÃO BACKEND (HumHub):
 * Substituir o array `articles` por dados vindos da API.
 * Endpoint sugerido: GET /api/v1/articles?limit=6
 *
 * Estrutura JSON esperada:
 * [
 *   {
 *     "id": 1,
 *     "title": "Título do artigo",
 *     "excerpt": "Resumo curto do artigo",
 *     "image": "https://url-da-imagem.jpg",
 *     "date": "05 Feb 2026",
 *     "category": "Saúde"
 *   }
 * ]
 */
const articles = [
  {
    id: 1,
    title: "Novo protocolo de higienização das mãos",
    excerpt: "Conheça as novas diretrizes de higienização baseadas nas recomendações da OMS.",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=300&fit=crop",
    date: "05 Feb 2026",
    category: "Saúde",
  },
  {
    id: 2,
    title: "Resultados da pesquisa de clima organizacional",
    excerpt: "Confira os resultados e as ações planejadas para melhorar o ambiente de trabalho.",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=300&fit=crop",
    date: "03 Feb 2026",
    category: "RH",
  },
  {
    id: 3,
    title: "Treinamento de emergência — próxima turma",
    excerpt: "Inscrições abertas para o próximo treinamento de atendimento a emergências.",
    image: "https://images.unsplash.com/photo-1551076805-e1869033e561?w=400&h=300&fit=crop",
    date: "01 Feb 2026",
    category: "Treinamento",
  },
  {
    id: 4,
    title: "Inauguração da nova ala pediátrica",
    excerpt: "A nova ala será inaugurada no dia 20 de fevereiro com capacidade ampliada.",
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=300&fit=crop",
    date: "28 Jan 2026",
    category: "Institucional",
  },
];

const NewsFeed = () => {
  return (
    <section className="relative px-6 pb-16" style={{ zIndex: 1 }}>
      <div className="max-w-6xl mx-auto">
        <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">
          📰 Fique por dentro:
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {articles.map((article) => (
            <div
              key={article.id}
              className="group glass rounded-2xl overflow-hidden hover:scale-[1.02] transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 cursor-pointer"
            >
              <div className="h-40 overflow-hidden">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="p-4">
                <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full mb-2">
                  {article.category}
                </span>
                <h4 className="font-display font-semibold text-sm text-foreground mb-2 line-clamp-2">
                  {article.title}
                </h4>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                  {article.excerpt}
                </p>
                <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {article.date}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsFeed;
