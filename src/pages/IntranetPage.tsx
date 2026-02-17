import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Book, FileText, HelpCircle, MapPin, FlaskConical, Bell, ExternalLink, LogOut, Shield, MessageCircle } from "lucide-react";
import { useChatAuth } from "@/contexts/ChatAuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import ChatWidget from "@/components/chat/ChatWidget";

const quickLinks = [
  { icon: Book, label: "Protocolos", href: "#" },
  { icon: FileText, label: "Documentos", href: "#" },
  { icon: HelpCircle, label: "FAQ", href: "#" },
  { icon: ExternalLink, label: "IA NAVARRO", href: "#" },
  { icon: MapPin, label: "Localização", href: "#" },
  { icon: FlaskConical, label: "Laboratório", href: "#" },
];

const IntranetPage = () => {
  const navigate = useNavigate();
  const { profile, signOut } = useChatAuth();
  const { isAdmin } = useUserRole();
  const [chatOpen, setChatOpen] = useState(false);
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/30 glass-strong">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-lg font-display font-bold gradient-text">Navarro Medical</h1>
            <nav className="hidden md:flex items-center gap-2">
              {["Sistemas", "Ferramentas", "Helpdesk"].map((item) => (
                <button key={item} className="px-4 py-1.5 rounded-full text-sm font-medium bg-primary/20 text-primary hover:bg-primary/30 transition-colors">{item}</button>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-xs text-muted-foreground">{timeStr} | {dateStr}</span>
            <button className="p-2 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors relative"><Bell className="w-5 h-5" /></button>
            {isAdmin && (
              <button onClick={() => navigate("/admin")} className="px-4 py-1.5 rounded-full text-sm font-medium bg-primary/20 text-primary hover:bg-primary/30 transition-colors"><Shield className="w-4 h-4 inline mr-1" />Admin</button>
            )}
            <button onClick={signOut} className="px-4 py-1.5 rounded-full text-sm font-medium bg-destructive/20 text-destructive hover:bg-destructive/30 transition-colors"><LogOut className="w-4 h-4 inline mr-1" />Sair</button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-display font-bold">Intranet <span className="gradient-text">Navarro Medical</span></h2>
          <div className="w-16 h-1 bg-primary mx-auto mt-3 rounded-full" />
        </div>
        {profile && (
          <div className="glass rounded-xl p-4 mb-8 text-center">
            <p className="text-muted-foreground">Bem-vindo, <span className="text-foreground font-medium">{profile.display_name}</span> — {profile.department}</p>
          </div>
        )}
        <section className="mb-10">
          <h3 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">🚀 Links Rápidos</h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {quickLinks.map(({ icon: Icon, label, href }) => (
              <a key={label} href={href} className="glass rounded-xl p-4 flex flex-col items-center gap-2 hover:bg-secondary/50 transition-colors group">
                <Icon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">{label}</span>
              </a>
            ))}
          </div>
        </section>
        <section className="grid md:grid-cols-2 gap-6 mb-10">
          <div className="glass rounded-xl p-6"><h3 className="font-display font-semibold mb-3 flex items-center gap-2">📰 Fique por dentro</h3><p className="text-sm text-muted-foreground">Conteúdos e atualizações serão exibidos aqui.</p></div>
          <div className="glass rounded-xl p-6"><h3 className="font-display font-semibold mb-3 flex items-center gap-2">🎂 Aniversariantes</h3><p className="text-sm text-muted-foreground">Aniversariantes do mês aparecerão aqui.</p></div>
        </section>
        <section className="glass rounded-xl p-6 mb-10"><h3 className="font-display font-semibold mb-3 flex items-center gap-2">📢 Avisos & Campanhas</h3><p className="text-sm text-muted-foreground">Avisos e campanhas serão listados aqui.</p></section>
      </main>
      {!chatOpen && (
        <button onClick={() => setChatOpen(true)} style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem' }} className="z-50 w-16 h-16 rounded-full shadow-lg hover:scale-105 transition-transform flex items-center justify-center bg-primary" title="Abrir Chat">
          <MessageCircle className="w-8 h-8 text-primary-foreground" />
        </button>
      )}
      {chatOpen && <ChatWidget onClose={() => setChatOpen(false)} />}
    </div>
  );
};

export default IntranetPage;
