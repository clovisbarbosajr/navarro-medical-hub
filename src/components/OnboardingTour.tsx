import { useState } from "react";
import { AlertTriangle, Camera, BellOff, MessageCircle, Paperclip, Download, FileText, X } from "lucide-react";

const STEPS = [
  {
    icon: <MessageCircle className="w-6 h-6" />,
    title: "Iniciar conversa",
    desc: "Clique em um contato online para iniciar uma conversa direta.",
  },
  {
    icon: <AlertTriangle className="w-6 h-6" />,
    title: "Pedido de Atenção",
    desc: "Use o ícone ⚠️ no topo da conversa. A tela do destinatário vai tremer com som de alerta!",
  },
  {
    icon: <Paperclip className="w-6 h-6" />,
    title: "Enviar arquivos",
    desc: "Clique no 📎 para enviar fotos, documentos e vídeos (até 10MB).",
  },
  {
    icon: <Download className="w-6 h-6" />,
    title: "Receber arquivos",
    desc: "Clique no arquivo recebido para visualizar ou no ícone de download para salvar.",
  },
  {
    icon: <Camera className="w-6 h-6" />,
    title: "Alterar foto",
    desc: "Nas configurações (⚙️) do chat, altere sua foto de perfil a qualquer momento.",
  },
  {
    icon: <BellOff className="w-6 h-6" />,
    title: "Som de notificação",
    desc: "Ative ou desative os sons nas configurações (⚙️) do chat.",
  },
];

const OnboardingTour = ({ onComplete }: { onComplete: () => void }) => {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/70 backdrop-blur-sm">
      <div className="glass-strong rounded-2xl p-6 max-w-xs w-full mx-4 space-y-4 animate-in relative">
        <button onClick={onComplete} className="absolute top-3 right-3 p-1 rounded-md hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-4 h-4" />
        </button>

        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            {current.icon}
          </div>
        </div>

        <div className="text-center">
          <h3 className="font-display text-lg font-bold text-foreground">{current.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{current.desc}</p>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5">
          {STEPS.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === step ? "bg-primary" : i < step ? "bg-primary/40" : "bg-muted"}`} />
          ))}
        </div>

        <div className="flex gap-2">
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} className="flex-1 h-10 rounded-xl border border-border/50 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/30 transition-colors">
              Voltar
            </button>
          )}
          <button
            onClick={() => isLast ? onComplete() : setStep(step + 1)}
            className="flex-1 menu-btn h-10 text-sm"
          >
            {isLast ? "Começar!" : "Próximo"}
          </button>
        </div>

        <p className="text-center text-[10px] text-muted-foreground">
          {step + 1} de {STEPS.length}
        </p>
      </div>
    </div>
  );
};

export default OnboardingTour;
