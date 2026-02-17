import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { AppRole } from "@/types/database";

interface AuthContextType {
  user: User | null;
  role: AppRole | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const nameToEmail = (name: string) => {
  return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, ".").replace(/[^a-z0-9.]/g, "") + "@navarro.med";
};

// Emails that have access to Procedimentos (besides admin role)
export const PROCEDURES_ALLOWED_EMAILS = ["inwise@navarro.med", "ligia@navarro.med"];

const REMEMBER_KEY = "navarro_remember_user";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRole = async (userId: string) => {
    try {
      const { data, error } = await (supabase as any)
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("Error fetching role:", error);
        return null;
      }
      return data?.role as AppRole;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        // Use setTimeout to avoid potential deadlock with Supabase auth
        setTimeout(async () => {
          const userRole = await fetchRole(session.user.id);
          setRole(userRole);
          setLoading(false);
        }, 0);
      } else {
        setUser(null);
        setRole(null);
        setLoading(false);
      }
    });

    // THEN check existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        const userRole = await fetchRole(session.user.id);
        setRole(userRole);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (username: string, password: string) => {
    const trimmed = username.trim();
    if (!trimmed) return { error: "Digite seu primeiro nome." };

    const email = nameToEmail(trimmed);
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      if (error.message.includes("Invalid login")) {
        return { error: "Usuário ou senha incorretos." };
      }
      return { error: error.message };
    }

    return { error: null };
  };

  const logout = async () => {
    localStorage.removeItem(REMEMBER_KEY);
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const getRememberedUser = () => localStorage.getItem(REMEMBER_KEY);
export const setRememberedUser = (username: string) => localStorage.setItem(REMEMBER_KEY, username);
export const clearRememberedUser = () => localStorage.removeItem(REMEMBER_KEY);
