import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { SiteSetting } from "@/types/database";
import { Save, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Switch } from "@/components/ui/switch";

const DEFAULT_SETTINGS = [
  { key: "site_title", label: "Título do Site", placeholder: "Navarro Medical" },
  { key: "site_subtitle", label: "Subtítulo", placeholder: "Intranet Corporativa" },
  { key: "footer_text", label: "Texto do Rodapé", placeholder: "© 2026 INWISEPRO" },
  { key: "login_url", label: "URL de Login Externo", placeholder: "http://localhost:8085/user/auth/login" },
];

const SiteSettingsManager = () => {
  const { toast } = useToast();
  const { role } = useAuth();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [customKey, setCustomKey] = useState("");
  const [customValue, setCustomValue] = useState("");

  const fetchSettings = async () => {
    const { data, error } = await (supabase as any)
      .from("site_settings")
      .select("*");
    if (!error && data) {
      const map: Record<string, string> = {};
      (data as SiteSetting[]).forEach((s) => {
        map[s.key] = s.value || "";
      });
      setSettings(map);
    }
    setLoading(false);
  };

  useEffect(() => { fetchSettings(); }, []);

  const handleSave = async (key: string, value: string) => {
    // Upsert
    const { data: existing } = await (supabase as any)
      .from("site_settings")
      .select("id")
      .eq("key", key)
      .single();

    let error;
    if (existing) {
      ({ error } = await (supabase as any).from("site_settings").update({ value }).eq("key", key));
    } else {
      ({ error } = await (supabase as any).from("site_settings").insert({ key, value }));
    }

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Salvo!" });
    }
  };

  const handleAddCustom = async () => {
    if (!customKey) return;
    setSettings((prev) => ({ ...prev, [customKey]: customValue }));
    await handleSave(customKey, customValue);
    setCustomKey("");
    setCustomValue("");
  };

  const handleDeleteCustom = async (key: string) => {
    const { error } = await (supabase as any).from("site_settings").delete().eq("key", key);
    if (!error) {
      setSettings((prev) => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
      toast({ title: "Removido!" });
    }
  };

  if (loading) return <div className="text-muted-foreground p-4">Carregando...</div>;

  const defaultKeys = DEFAULT_SETTINGS.map((s) => s.key);
  const customSettings = Object.entries(settings).filter(([key]) => !defaultKeys.includes(key));

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-foreground mb-6">⚙️ Configurações do Site</h2>

      {/* Maintenance Mode Toggle — Admin only */}
      {role === "admin" && (
        <div className="glass rounded-xl p-4 mb-6 border border-amber-500/30 bg-amber-500/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">🚧 Modo Manutenção</p>
              <p className="text-xs text-muted-foreground mt-1">
                Quando ativado, a página pública exibe uma tela de manutenção. Login e dashboard continuam funcionando.
              </p>
            </div>
            <Switch
              checked={settings["maintenance_mode"] === "true"}
              onCheckedChange={async (checked) => {
                const val = checked ? "true" : "false";
                setSettings((prev) => ({ ...prev, maintenance_mode: val }));
                await handleSave("maintenance_mode", val);
              }}
            />
          </div>
        </div>
      )}

      {/* Default Settings */}
      <div className="space-y-4 mb-8">
        {DEFAULT_SETTINGS.map((setting) => (
          <div key={setting.key} className="glass rounded-xl p-4">
            <label className="text-sm font-medium text-foreground mb-2 block">{setting.label}</label>
            <div className="flex gap-2">
              <input
                value={settings[setting.key] || ""}
                onChange={(e) => setSettings({ ...settings, [setting.key]: e.target.value })}
                placeholder={setting.placeholder}
                className="flex-1 h-10 rounded-xl border border-input bg-secondary/50 px-3 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button
                onClick={() => handleSave(setting.key, settings[setting.key] || "")}
                className="h-10 px-4 rounded-xl bg-primary/20 text-primary text-sm font-medium hover:bg-primary/30 transition-colors flex items-center gap-1"
              >
                <Save className="w-3 h-3" /> Salvar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Custom Settings */}
      <h3 className="font-display font-semibold text-sm text-primary mb-3">Configurações Personalizadas</h3>

      {customSettings.length > 0 && (
        <div className="space-y-2 mb-4">
          {customSettings.map(([key, value]) => (
            <div key={key} className="glass rounded-xl p-3 flex items-center gap-3">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground font-mono">{key}</p>
                <p className="text-sm text-foreground">{value}</p>
              </div>
              <button
                onClick={() => handleDeleteCustom(key)}
                className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="glass rounded-xl p-4">
        <div className="flex gap-2">
          <input
            value={customKey}
            onChange={(e) => setCustomKey(e.target.value)}
            placeholder="Chave"
            className="w-32 h-10 rounded-xl border border-input bg-secondary/50 px-3 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <input
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            placeholder="Valor"
            className="flex-1 h-10 rounded-xl border border-input bg-secondary/50 px-3 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button
            onClick={handleAddCustom}
            disabled={!customKey}
            className="menu-btn flex items-center gap-1 text-sm"
          >
            <Plus className="w-4 h-4" /> Adicionar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SiteSettingsManager;
