import { useState } from "react";
import { X, ChevronLeft, ChevronRight, Images } from "lucide-react";

/**
 * GALLERY SECTION — "📸 Galeria"
 *
 * INTEGRAÇÃO BACKEND (HumHub):
 * Substituir o array `galleries` por dados vindos da API.
 * Endpoint sugerido: GET /api/v1/galleries
 *
 * Estrutura JSON esperada:
 * [
 *   {
 *     "id": 1,
 *     "title": "Nome do álbum",
 *     "cover": "https://url-da-capa.jpg",
 *     "photos": [
 *       "https://url-foto-1.jpg",
 *       "https://url-foto-2.jpg"
 *     ]
 *   }
 * ]
 *
 * As fotos são enviadas via upload pelo administrador
 * através do painel administrativo do HumHub.
 */
const galleries = [
  {
    id: 1,
    title: "Confraternização Fim de Ano 2025",
    cover: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop",
    photos: [
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=1200&h=800&fit=crop",
    ],
  },
  {
    id: 2,
    title: "Semana da Enfermagem",
    cover: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&h=400&fit=crop",
    photos: [
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1551076805-e1869033e561?w=1200&h=800&fit=crop",
    ],
  },
  {
    id: 3,
    title: "Dia do Médico",
    cover: "https://images.unsplash.com/photo-1551076805-e1869033e561?w=600&h=400&fit=crop",
    photos: [
      "https://images.unsplash.com/photo-1551076805-e1869033e561?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&h=800&fit=crop",
    ],
  },
  {
    id: 4,
    title: "Workshop de Inovação",
    cover: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=600&h=400&fit=crop",
    photos: [
      "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=800&fit=crop",
    ],
  },
];

const GallerySection = () => {
  const [openGallery, setOpenGallery] = useState<typeof galleries[0] | null>(null);
  const [currentPhoto, setCurrentPhoto] = useState(0);

  const openViewer = (gallery: typeof galleries[0]) => {
    setOpenGallery(gallery);
    setCurrentPhoto(0);
  };

  const closeViewer = () => {
    setOpenGallery(null);
    setCurrentPhoto(0);
  };

  const nextPhoto = () => {
    if (!openGallery) return;
    setCurrentPhoto((prev) => (prev + 1) % openGallery.photos.length);
  };

  const prevPhoto = () => {
    if (!openGallery) return;
    setCurrentPhoto((prev) => (prev - 1 + openGallery.photos.length) % openGallery.photos.length);
  };

  return (
    <>
      <section className="relative px-6 pb-20" style={{ zIndex: 1 }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">
            📸 Galeria
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {galleries.map((gallery) => (
              <div
                key={gallery.id}
                onClick={() => openViewer(gallery)}
                className="group relative overflow-hidden rounded-2xl glass cursor-pointer hover:scale-[1.02] transition-transform duration-300"
              >
                {/* Cover thumbnail */}
                <img
                  src={gallery.cover}
                  alt={gallery.title}
                  className="w-full h-52 object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent flex flex-col justify-end p-4">
                  <p className="text-sm font-display font-semibold text-foreground">{gallery.title}</p>
                  <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground mt-1">
                    <Images className="w-3 h-3" />
                    {gallery.photos.length} fotos
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox viewer */}
      {openGallery && (
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 80 }}>
          <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={closeViewer} />
          <div className="relative max-w-4xl w-full">
            {/* Close button */}
            <button
              onClick={closeViewer}
              className="absolute -top-12 right-0 w-10 h-10 rounded-full glass flex items-center justify-center text-foreground hover:text-primary transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Title */}
            <h3 className="absolute -top-12 left-0 font-display font-bold text-foreground text-lg">
              {openGallery.title}
            </h3>

            {/* Photo */}
            <div className="relative rounded-2xl overflow-hidden glass">
              <img
                src={openGallery.photos[currentPhoto]}
                alt={`${openGallery.title} — foto ${currentPhoto + 1}`}
                className="w-full h-[60vh] object-cover"
              />

              {/* Arrows */}
              {openGallery.photos.length > 1 && (
                <>
                  <button
                    onClick={prevPhoto}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass flex items-center justify-center text-foreground hover:text-primary transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextPhoto}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass flex items-center justify-center text-foreground hover:text-primary transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 glass rounded-full px-4 py-1.5 text-xs font-semibold text-foreground">
                {currentPhoto + 1} / {openGallery.photos.length}
              </div>
            </div>

            {/* Thumbnails */}
            <div className="flex gap-2 mt-4 justify-center">
              {openGallery.photos.map((photo, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPhoto(i)}
                  className={`w-16 h-12 rounded-lg overflow-hidden transition-all duration-200 ${
                    i === currentPhoto
                      ? "ring-2 ring-primary scale-105"
                      : "opacity-50 hover:opacity-80"
                  }`}
                >
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GallerySection;
