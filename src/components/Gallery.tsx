// Mock gallery photos — ready for HumHub integration
const photos = [
  { src: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=300&fit=crop", caption: "Confraternização Fim de Ano 2025" },
  { src: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=300&fit=crop", caption: "Semana da Enfermagem" },
  { src: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=300&fit=crop", caption: "Treinamento de Emergência" },
  { src: "https://images.unsplash.com/photo-1551076805-e1869033e561?w=400&h=300&fit=crop", caption: "Dia do Médico" },
  { src: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=400&h=300&fit=crop", caption: "Workshop de Inovação" },
  { src: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=300&fit=crop", caption: "Inauguração Nova Ala" },
];

const Gallery = () => {
  return (
    <section className="relative px-6 pb-20" style={{ zIndex: 1 }}>
      <div className="max-w-6xl mx-auto">
        <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">
          📸 Galeria &amp; Confraternizações
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {photos.map((photo, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-2xl glass cursor-pointer hover:scale-[1.02] transition-transform duration-300"
            >
              <img
                src={photo.src}
                alt={photo.caption}
                className="w-full h-52 object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <p className="text-sm font-medium text-foreground">{photo.caption}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;
