import { useState } from "react";
import { X, ExternalLink } from "lucide-react";

interface IframeOverlayProps {
  url: string;
  title: string;
  onClose: () => void;
}

const IframeOverlay = ({ url, title, onClose }: IframeOverlayProps) => {
  const [blocked, setBlocked] = useState(false);

  return (
    <div className="fixed inset-0 flex flex-col" style={{ zIndex: 9999 }}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Top bar */}
      <div className="relative flex items-center justify-between px-4 h-12 bg-background/95 border-b border-border shadow-md">
        <span className="font-display font-semibold text-sm text-foreground truncate">{title}</span>
        <div className="flex items-center gap-2">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Abrir em nova aba"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="relative flex-1">
        {blocked ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 bg-background/95">
            <p className="text-muted-foreground text-sm text-center max-w-md px-4">
              Este site não permite ser exibido embutido. Clique abaixo para abrir em nova aba.
            </p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="menu-btn flex items-center gap-2 text-sm"
            >
              <ExternalLink className="w-4 h-4" /> Abrir {title}
            </a>
          </div>
        ) : (
          <iframe
            src={url}
            title={title}
            className="w-full h-full border-0 bg-white"
            allow="clipboard-write; clipboard-read"
            onError={() => setBlocked(true)}
            onLoad={(e) => {
              try {
                // If we can't access contentWindow.location, it loaded fine
                // If it's blocked, the iframe will show an error page
                const iframe = e.currentTarget;
                // Some browsers fire onLoad even for blocked frames
                // We check if the iframe body is empty or has error content
                if (iframe.contentDocument === null) {
                  setBlocked(true);
                }
              } catch {
                // Cross-origin — means it loaded successfully
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

export default IframeOverlay;
