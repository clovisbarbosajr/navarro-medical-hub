import { X } from "lucide-react";

interface IframeOverlayProps {
  url: string;
  title: string;
  onClose: () => void;
}

const IframeOverlay = ({ url, title, onClose }: IframeOverlayProps) => {
  return (
    <div className="fixed inset-0 flex flex-col" style={{ zIndex: 9999 }}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Top bar */}
      <div className="relative flex items-center justify-between px-4 h-12 bg-background/95 border-b border-border shadow-md">
        <span className="font-display font-semibold text-sm text-foreground truncate">{title}</span>
        <button
          onClick={onClose}
          className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Iframe */}
      <div className="relative flex-1">
        <iframe
          src={url}
          title={title}
          className="w-full h-full border-0 bg-white"
          allow="clipboard-write; clipboard-read"
        />
      </div>
    </div>
  );
};

export default IframeOverlay;
