import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Images } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { GalleryImage } from "@/types/database";

const GallerySection = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      const { data, error } = await (supabase as any)
        .from("gallery_images")
        .select("*")
        .order("sort_order", { ascending: true });
      if (!error && data) setImages(data);
      setLoading(false);
    };
    fetchImages();
  }, []);

  const openViewer = (index: number) => setViewerIndex(index);
  const closeViewer = () => setViewerIndex(null);

  const nextPhoto = () => {
    if (viewerIndex === null) return;
    setViewerIndex((prev) => ((prev ?? 0) + 1) % images.length);
  };

  const prevPhoto = () => {
    if (viewerIndex === null) return;
    setViewerIndex((prev) => ((prev ?? 0) - 1 + images.length) % images.length);
  };

  // Keyboard navigation
  useEffect(() => {
    if (viewerIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeViewer();
      if (e.key === "ArrowRight") nextPhoto();
      if (e.key === "ArrowLeft") prevPhoto();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [viewerIndex, images.length]);

  if (loading || images.length === 0) return null;

  return (
    <>
      <section className="relative px-4 md:px-6 pb-14 md:pb-20" style={{ zIndex: 1 }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mb-6 md:mb-8 text-center">
            📸 Galeria
          </h2>
          <div className={`grid gap-3 md:gap-5 ${
            images.length === 1
              ? "grid-cols-1 max-w-sm mx-auto"
              : images.length === 2
              ? "grid-cols-2 max-w-2xl mx-auto"
              : "grid-cols-2 sm:grid-cols-2 lg:grid-cols-4"
          }`}>
            {images.map((img, i) => (
              <div
                key={img.id}
                onClick={() => openViewer(i)}
                className="group relative overflow-hidden rounded-2xl glass cursor-pointer hover:scale-[1.02] transition-transform duration-300"
              >
                <div className="w-full h-52 bg-black/10 flex items-center justify-center overflow-hidden">
                  <img
                    src={img.image_url}
                    alt={img.title}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent flex flex-col justify-end p-4">
                  <p className="text-sm font-display font-semibold text-foreground">{img.title}</p>
                  {img.description && (
                    <span className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                      {img.description}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-[10px] text-muted-foreground mt-4">
            <Images className="w-3 h-3 inline mr-1" />
            {images.length} {images.length === 1 ? "imagem" : "imagens"} na galeria
          </p>
        </div>
      </section>

      {/* Lightbox viewer */}
      {viewerIndex !== null && images[viewerIndex] && (
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 80 }}>
          <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={closeViewer} />
          <div className="relative max-w-4xl w-full">
            {/* Close button — prominent */}
            <button
              onClick={closeViewer}
              className="absolute -top-14 right-0 flex items-center gap-2 px-4 py-2 rounded-full glass-strong text-foreground hover:text-primary transition-colors z-10"
              title="Fechar (Esc)"
            >
              <X className="w-5 h-5" />
              <span className="text-sm font-medium">Fechar</span>
            </button>

            {/* Title */}
            <h3 className="absolute -top-14 left-0 font-display font-bold text-foreground text-lg truncate max-w-[60%]">
              {images[viewerIndex].title}
            </h3>

            {/* Photo */}
            <div className="relative rounded-2xl overflow-hidden glass">
                <div className="w-full h-[60vh] bg-black/20 flex items-center justify-center">
                  <img
                    src={images[viewerIndex].image_url}
                    alt={images[viewerIndex].title}
                    className="w-full h-full object-contain"
                  />
                </div>

              {/* Arrows */}
              {images.length > 1 && (
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
                {viewerIndex + 1} / {images.length}
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 mt-4 justify-center overflow-x-auto pb-2">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setViewerIndex(i)}
                    className={`w-16 h-12 rounded-lg overflow-hidden transition-all duration-200 flex-shrink-0 ${
                      i === viewerIndex
                        ? "ring-2 ring-primary scale-105"
                        : "opacity-50 hover:opacity-80"
                    }`}
                  >
                    <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Description */}
            {images[viewerIndex].description && (
              <p className="text-center text-sm text-muted-foreground mt-3">
                {images[viewerIndex].description}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default GallerySection;
