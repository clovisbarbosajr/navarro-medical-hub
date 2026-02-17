import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  profile: { display_name: string; department: string; avatar_url: string | null } | null;
  loading: boolean;
  signInByName: (name: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const ChatAuthContext = createContext<AuthContextType | null>(null);

export const useChatAuth = () => {
  const ctx = useContext(ChatAuthContext);
  if (!ctx) throw new Error("useChatAuth must be used within ChatAuthProvider");
  return ctx;
};

const nameToEmail = (name: string) => {
  return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, ".").replace(/[^a-z0-9.]/g, "") + "@navarro.med";
};

export const ChatAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AuthContextType["profile"]>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data } = await (supabase as any)
      .from("user_profiles")
      .select("display_name, department, avatar_url")
      .eq("user_id", userId)
      .maybeSingle();
    if (data) setProfile(data);
  };

  useEffect(() => {
    let isMounted = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!isMounted) return;
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => {
          if (isMounted) {
            fetchProfile(session.user.id);
            (supabase as any).from("user_profiles").update({ is_online: true }).eq("user_id", session.user.id);
          }
        }, 0);
      } else {
        setProfile(null);
      }
    });
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
          await (supabase as any).from("user_profiles").update({ is_online: true }).eq("user_id", session.user.id);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    initializeAuth();
    return () => { isMounted = false; subscription.unsubscribe(); };
  }, []);

  const signInByName = async (name: string, password: string) => {
    const email = nameToEmail(name);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      if (signInError.message.includes("Invalid login credentials")) {
        const { error: signUpError, data } = await supabase.auth.signUp({
          email, password, options: { data: { display_name: name } },
        });
        if (signUpError) throw new Error("Usuário ou senha incorretos");
        if (data.user && data.user.identities && data.user.identities.length > 0) {
          await (supabase as any).from("user_profiles").update({ display_name: name }).eq("user_id", data.user.id);
          const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
          if (loginError) throw new Error("Erro ao entrar. Tente novamente.");
        } else {
          throw new Error("Usuário ou senha incorretos");
        }
      } else {
        throw new Error("Erro ao entrar: " + signInError.message);
      }
    }
  };

  const signOut = async () => {
    if (user) {
      await (supabase as any).from("user_profiles").update({ is_online: false, last_seen: new Date().toISOString() }).eq("user_id", user.id);
    }
    await supabase.auth.signOut();
  };

  const refreshProfile = async () => { if (user) await fetchProfile(user.id); };

  return (
    <ChatAuthContext.Provider value={{ user, profile, loading, signInByName, signOut, refreshProfile }}>
      {children}
    </ChatAuthContext.Provider>
  );
};
