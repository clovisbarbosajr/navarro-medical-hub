import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, getRememberedUser, setRememberedUser, clearRememberedUser } from "@/contexts/AuthContext";
import FlowFieldBackground from "@/components/FlowFieldBackground";
import { Eye, EyeOff, Lock, User, Shield } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { user, login, loading } = useAuth();
  const [username, setUsername] = useState("Admin");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const remembered = getRememberedUser();
    if (remembered) {
      setUsername(remembered);
      setRemember(true);
    }
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const result = await login(username, password);

    if (result.error) {
      setError(result.error);
      setSubmitting(false);
    } else {
      if (remember) {
        setRememberedUser(username);
      } else {
        clearRememberedUser();
      }
      navigate("/dashboard", { replace: true });
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      <FlowFieldBackground />

      {/* Login Card */}
      <div
        className={`relative w-full max-w-md mx-4 transition-all duration-700 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
        style={{ zIndex: 10 }}
      >
        <div className="glass-strong rounded-3xl p-8 sm:p-10 shadow-2xl animate-pulse-glow">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground mb-1">
              Navarro Medical
            </h1>
            <p className="text-muted-foreground text-sm">
              Acesso Administrativo
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Select */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                Usuário
              </label>
              <div className="relative">
                <select
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full h-12 rounded-xl border border-input bg-secondary/50 px-4 text-foreground text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                >
                  <option value="Admin">🔑 Admin</option>
                  <option value="Manager">📋 Manager</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  className="w-full h-12 rounded-xl border border-input bg-secondary/50 px-4 pr-12 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="checkbox-wrapper flex items-center gap-3">
              <input
                type="checkbox"
                id="remember-me"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <label htmlFor="remember-me" className="text-sm text-muted-foreground cursor-pointer select-none">
                Lembrar credenciais
              </label>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3 text-sm text-destructive animate-fade-slide-up">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting || !password}
              className={`menu-btn w-full h-12 text-center text-base font-semibold transition-all ${
                submitting || !password ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Entrando...
                </span>
              ) : (
                "Entrar"
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            © 2026 INWISEPRO — Acesso restrito
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
