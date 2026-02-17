import { X, Download } from "lucide-react";

interface Props { url: string; name: string; type: string | null; onClose: () => void; }

const FilePreviewModal = ({ url, name, type, onClose }: Props) => {
  const isImage = type?.startsWith("image/");
  const isVideo = type?.startsWith("video/");
  const isPdf = type === "application/pdf";

  const handleDownload = async () => {
    const res = await fetch(url); const blob = await res.blob();
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; a.click(); URL.revokeObjectURL(a.href);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 fade-in" onClick={onClose}>
      <div className="relative max-w-[90vw] max-h-[90vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
        <div className="absolute -top-10 right-0 flex items-center gap-2">
          <button onClick={handleDownload} className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"><Download className="w-5 h-5" /></button>
          <button onClick={onClose} className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>
        {isImage && <img src={url} alt={name} className="max-w-full max-h-[85vh] rounded-lg object-contain shadow-2xl" />}
        {isVideo && <video src={url} controls autoPlay className="max-w-full max-h-[85vh] rounded-lg shadow-2xl">Seu navegador não suporta vídeo.</video>}
        {isPdf && <iframe src={url} title={name} className="w-[80vw] h-[85vh] rounded-lg bg-white shadow-2xl" />}
        {!isImage && !isVideo && !isPdf && (
          <div className="bg-card rounded-xl p-8 text-center space-y-3 shadow-2xl">
            <p className="text-sm text-foreground font-medium">{name}</p>
            <p className="text-xs text-muted-foreground">Pré-visualização não disponível</p>
            <button onClick={handleDownload} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-xs hover:opacity-90">Baixar arquivo</button>
          </div>
        )}
        <p className="mt-2 text-xs text-white/70">{name}</p>
      </div>
    </div>
  );
};

export default FilePreviewModal;
