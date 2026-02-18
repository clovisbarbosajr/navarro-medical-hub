import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useChatAuth } from "@/contexts/ChatAuthContext";
import { supabase } from "@/integrations/supabase/client";
import FlowFieldBackground from "@/components/FlowFieldBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const SAVED_LOGINS_KEY = "navarro_saved_logins";
interface SavedLogin { name: string; }
const getSavedLogins = (): SavedLogin[] => { try { return JSON.parse(localStorage.getItem(SAVED_LOGINS_KEY) || "[]"); } catch { return []; } };
const saveLogin = (name: string) => { const logins = getSavedLogins(); if (!logins.find((l) => l.name === name)) { logins.push({ name }); localStorage.setItem(SAVED_LOGINS_KEY, JSON.stringify(logins)); } };
const removeSavedLogin = (name: string) => { const logins = getSavedLogins().filter((l) => l.name !== name); localStorage.setItem(SAVED_LOGINS_KEY, JSON.stringify(logins)); };

const nameToEmail = (name: string) => {
  return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, ".").replace(/[^a-z0-9.]/g, "") + "@navarro.med";
};

interface MatchingUser {
  display_name: string;
  user_id: string;
}

const LoginPage = () => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [wantSave, setWantSave] = useState(false);
  const [savedLogins, setSavedLogins] = useState<SavedLogin[]>([]);
  const [matchingUsers, setMatchingUsers] = useState<MatchingUser[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const { user, signInByName } = useChatAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => { if (user) navigate("/", { replace: true }); }, [user, navigate]);
  useEffect(() => { setSavedLogins(getSavedLogins()); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || !password) return;

    // Check if it's a single first name (no spaces) — might have duplicates
    if (!trimmed.includes(" ")) {
      setLoading(true);
      try {
        // Search for users whose display_name starts with this first name
        const { data: profiles } = await (supabase as any)
          .from("user_profiles")
          .select("display_name, user_id")
          .ilike("display_name", `${trimmed}%`);

        if (profiles && profiles.length > 1) {
          // Multiple matches — show picker
          setMatchingUsers(profiles);
          setShowPicker(true);
          setLoading(false);
          return;
        }

        // Single match or no match — try with the matched full name or original
        const loginName = profiles && profiles.length === 1 ? profiles[0].display_name : trimmed;
        await signInByName(loginName, password);
        if (wantSave) saveLogin(trimmed);
      } catch (err: any) {
        toast({ title: "Erro", description: err.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    } else {
      // Full name provided — direct login
      setLoading(true);
      try {
        await signInByName(trimmed, password);
        if (wantSave) saveLogin(trimmed);
      } catch (err: any) {
        toast({ title: "Erro", description: err.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePickUser = async (fullName: string) => {
    setShowPicker(false);
    setLoading(true);
    try {
      await signInByName(fullName, password);
      if (wantSave) saveLogin(name.trim());
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
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
            <Input type="text" placeholder="Seu primeiro nome" value={name} onChange={(e) => setName(e.target.value)} required autoFocus className="bg-secondary/50 border-border/50 focus:border-primary" />
            <Input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-secondary/50 border-border/50 focus:border-primary" />
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={wantSave} onChange={(e) => setWantSave(e.target.checked)} className="w-4 h-4 rounded border-border accent-primary" /><span className="text-xs text-muted-foreground">Salvar login</span></label>
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity" disabled={loading}>
              {loading ? (<span className="flex items-center gap-2"><span className="typing-dot w-1.5 h-1.5 rounded-full bg-primary-foreground" /><span className="typing-dot w-1.5 h-1.5 rounded-full bg-primary-foreground" /><span className="typing-dot w-1.5 h-1.5 rounded-full bg-primary-foreground" /></span>) : "Entrar"}
            </Button>
          </form>
        </div>
      </div>

      {/* Name picker dialog */}
      {showPicker && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-md">
          <div className="glass-strong rounded-2xl p-6 max-w-sm w-full mx-4 space-y-4 animate-in">
            <div className="text-center">
              <h3 className="font-display text-lg font-bold text-foreground">Qual é você?</h3>
              <p className="text-sm text-muted-foreground mt-1">Encontramos mais de uma pessoa com esse nome</p>
            </div>
            <div className="space-y-2">
              {matchingUsers.map((u) => (
                <button
                  key={u.user_id}
                  onClick={() => handlePickUser(u.display_name)}
                  className="w-full text-left px-4 py-3 rounded-xl bg-secondary/40 hover:bg-secondary/70 text-sm font-medium text-foreground transition-colors"
                >
                  {u.display_name}
                </button>
              ))}
            </div>
            <button onClick={() => setShowPicker(false)} className="w-full text-center text-xs text-muted-foreground hover:text-foreground hover:underline">
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
