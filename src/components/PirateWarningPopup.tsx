import { useState } from "react";

const PirateWarningPopup = () => {
  const [open, setOpen] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2147483647,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(6px)",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          background: "#121212",
          borderRadius: "15px",
          border: "1.5px solid #FF4D4D",
          boxShadow: "0 0 20px rgba(255,77,77,0.4), 0 0 60px rgba(255,77,77,0.15), inset 0 1px 0 rgba(255,255,255,0.05)",
          maxWidth: "520px",
          width: "92%",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "32px 28px",
          position: "relative",
          animation: "popIn 0.3s ease-out",
        }}
      >
        {/* Close button */}
        <button
          onClick={() => setOpen(false)}
          style={{
            position: "absolute",
            top: "12px",
            right: "14px",
            background: "none",
            border: "none",
            color: "#666",
            fontSize: "22px",
            cursor: "pointer",
            lineHeight: 1,
          }}
          aria-label="Fechar"
        >
          ✕
        </button>

        {/* Warning icon + Title */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div style={{ fontSize: "38px", marginBottom: "10px" }}>⚠️</div>
          <h2
            style={{
              color: "#FF4D4D",
              fontSize: "20px",
              fontWeight: 800,
              margin: 0,
              lineHeight: 1.3,
              textShadow: "0 0 20px rgba(255,77,77,0.3)",
            }}
          >
            ☠️ Você está usando uma extensão pirateada!
            <br />
            <span style={{ fontSize: "15px", fontWeight: 600 }}>(seus projetos correm perigo)</span>
          </h2>
        </div>

        {/* Subtitle */}
        <p
          style={{
            textAlign: "center",
            color: "#ccc",
            fontSize: "15px",
            margin: "0 0 22px",
            lineHeight: 1.5,
          }}
        >
          Adquira sua versão oficial com{" "}
          <span
            style={{
              color: "#00FF88",
              fontWeight: 700,
              textShadow: "0 0 10px rgba(0,255,136,0.3)",
            }}
          >
            50% de desconto
          </span>{" "}
          e fuja da pirataria!
        </p>

        {/* Plans image placeholder */}
        <div
          style={{
            background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.08)",
            padding: "36px 20px",
            textAlign: "center",
            marginBottom: "24px",
          }}
        >
          <div style={{ fontSize: "32px", marginBottom: "8px" }}>📋</div>
          <p style={{ color: "#888", fontSize: "13px", margin: 0, fontStyle: "italic" }}>
            Imagem dos Planos ColdLov #2026
          </p>
        </div>

        {/* Discord / VIP button */}
        <a
          href="https://chat.whatsapp.com/EfZzKBiB5Ws8a1kmfFjDmk"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "block",
            width: "100%",
            padding: "13px",
            backgroundColor: "#5865F2",
            color: "#fff",
            fontWeight: 700,
            fontSize: "15px",
            border: "none",
            borderRadius: "10px",
            textAlign: "center",
            textDecoration: "none",
            cursor: "pointer",
            boxSizing: "border-box",
            transition: "filter 0.2s",
          }}
        >
          🔗 Entrar no Grupo VIP
        </a>
        <div
          onClick={() => handleCopy("https://chat.whatsapp.com/EfZzKBiB5Ws8a1kmfFjDmk", "link")}
          style={{
            textAlign: "center",
            fontSize: "11px",
            color: "#5865F2",
            margin: "6px 0 18px",
            cursor: "pointer",
            wordBreak: "break-all",
          }}
        >
          {copied === "link" ? "✅ Copiado!" : "https://chat.whatsapp.com/EfZzKBiB5Ws8a1kmfFjDmk"}
        </div>

        {/* WhatsApp button */}
        <a
          href="https://wa.me/551152291325"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "block",
            width: "100%",
            padding: "13px",
            backgroundColor: "transparent",
            color: "#fff",
            fontWeight: 700,
            fontSize: "15px",
            border: "1.5px solid rgba(255,255,255,0.25)",
            borderRadius: "10px",
            textAlign: "center",
            textDecoration: "none",
            cursor: "pointer",
            boxSizing: "border-box",
          }}
        >
          📱 WhatsApp Oficial
        </a>
        <div
          onClick={() => handleCopy("+55 11 5229-1325", "phone")}
          style={{
            textAlign: "center",
            fontSize: "11px",
            color: "#999",
            margin: "6px 0 22px",
            cursor: "pointer",
          }}
        >
          {copied === "phone" ? "✅ Copiado!" : "+55 11 5229-1325"}
        </div>

        {/* Footer warning */}
        <div
          style={{
            background: "rgba(255,77,77,0.12)",
            border: "1px solid rgba(255,77,77,0.3)",
            borderRadius: "10px",
            padding: "14px 16px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              color: "#FF4D4D",
              fontWeight: 700,
              fontSize: "13px",
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            ☠️ Quem te enviou essa extensão é um <span style={{ textTransform: "uppercase" }}>GOLPISTA</span>! ☠️
          </p>
        </div>
      </div>

      {/* Keyframes via style tag */}
      <style>{`
        @keyframes popIn {
          0% { opacity: 0; transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default PirateWarningPopup;
