import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useChatAuth } from "@/contexts/ChatAuthContext";
import FlowFieldBackground from "@/components/FlowFieldBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const SAVED_LOGINS_KEY = "navarro_saved_logins";
interface SavedLogin { name: string; }
const getSavedLogins = (): SavedLogin[] => { try { return JSON.parse(localStorage.getItem(SAVED_LOGINS_KEY) || "[]"); } catch { return []; } };
const saveLogin = (name: string) => { const logins = getSavedLogins(); if (!logins.find((l) => l.name === name)) { logins.push({ name }); localStorage.setItem(SAVED_LOGINS_KEY, JSON.stringify(logins)); } };
const removeSavedLogin = (name: string) => { const logins = getSavedLogins().filter((l) => l.name !== name); localStorage.setItem(SAVED_LOGINS_KEY, JSON.stringify(logins)); };

const LoginPage = () => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [wantSave, setWantSave] = useState(false);
  const [savedLogins, setSavedLogins] = useState<SavedLogin[]>([]);
  const { user, signInByName } = useChatAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => { if (user) navigate("/", { replace: true }); }, [user, navigate]);
  useEffect(() => { setSavedLogins(getSavedLogins()); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || !password) return;
    setLoading(true);
    try { await signInByName(trimmed, password); if (wantSave) saveLogin(trimmed); }
    catch (err: any) { toast({ title: "Erro", description: err.message, variant: "destructive" }); }
    finally { setLoading(false); }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <FlowFieldBackground />
      <div className="relative z-10 w-full max-w-md px-4 animate-in">
        <div className="glass-strong rounded-2xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-display font-bold gradient-text">Navarro Connect</h1>
            <p className="text-muted-foreground text-sm">Chat corporativo interno</p>
          </div>
          {savedLogins.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">Logins salvos:</p>
              {savedLogins.map((sl) => (
                <div key={sl.name} className="flex items-center gap-2">
                  <button type="button" onClick={() => setName(sl.name)} className="flex-1 text-left px-3 py-2 rounded-lg bg-secondary/40 hover:bg-secondary/60 text-sm text-foreground transition-colors">{sl.name}</button>
                  <button type="button" onClick={() => { removeSavedLogin(sl.name); setSavedLogins(getSavedLogins()); }} className="p-1.5 rounded-md hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors" title="Remover login salvo"><X className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input type="text" placeholder="Login" value={name} onChange={(e) => setName(e.target.value)} required autoFocus className="bg-secondary/50 border-border/50 focus:border-primary" />
            <Input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-secondary/50 border-border/50 focus:border-primary" />
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={wantSave} onChange={(e) => setWantSave(e.target.checked)} className="w-4 h-4 rounded border-border accent-primary" /><span className="text-xs text-muted-foreground">Salvar login</span></label>
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity" disabled={loading}>
              {loading ? (<span className="flex items-center gap-2"><span className="typing-dot w-1.5 h-1.5 rounded-full bg-primary-foreground" /><span className="typing-dot w-1.5 h-1.5 rounded-full bg-primary-foreground" /><span className="typing-dot w-1.5 h-1.5 rounded-full bg-primary-foreground" /></span>) : "Entrar"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
