import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Palette } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface Department { id: string; name: string; color: string; user_count?: number; }

const PRESET_COLORS = ["#f87171", "#fb923c", "#fbbf24", "#34d399", "#14b8a6", "#60a5fa", "#818cf8", "#a78bfa", "#f472b6", "#94a3b8"];

const AdminDepartmentsTab = () => {
  const { toast } = useToast();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#14b8a6");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editColor, setEditColor] = useState("");

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    const [{ data: depts }, { data: profiles }] = await Promise.all([
      supabase.from("departments").select("id, name, color").order("name"),
      supabase.from("user_profiles").select("department"),
    ]);
    const countMap = new Map<string, number>();
    profiles?.forEach(p => countMap.set(p.department, (countMap.get(p.department) || 0) + 1));
    setDepartments((depts || []).map(d => ({ ...d, user_count: countMap.get(d.name) || 0 })));
    setLoading(false);
  }, []);

  useEffect(() => { fetchDepartments(); }, [fetchDepartments]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const { error } = await supabase.from("departments").insert({ name: newName.trim(), color: newColor });
    if (error) { toast({ title: "Erro", description: error.message.includes("duplicate") ? "Departamento já existe" : error.message, variant: "destructive" }); }
    else { toast({ title: "Departamento criado", description: newName.trim() }); setNewName(""); setNewColor("#14b8a6"); fetchDepartments(); }
  };

  const handleUpdateColor = async (id: string) => {
    await supabase.from("departments").update({ color: editColor }).eq("id", id);
    setEditingId(null); fetchDepartments(); toast({ title: "Cor atualizada" });
  };

  const handleDelete = async (dept: Department) => {
    if (dept.user_count && dept.user_count > 0) { toast({ title: "Não é possível", description: `${dept.user_count} usuário(s) estão neste departamento. Mova-os primeiro.`, variant: "destructive" }); return; }
    if (!confirm(`Apagar o departamento "${dept.name}"?`)) return;
    await supabase.from("departments").delete().eq("id", dept.id);
    fetchDepartments(); toast({ title: "Departamento apagado" });
  };

  if (loading) return <div className="flex justify-center py-12"><div className="flex gap-1.5"><span className="typing-dot w-2.5 h-2.5 rounded-full bg-primary" /><span className="typing-dot w-2.5 h-2.5 rounded-full bg-primary" /><span className="typing-dot w-2.5 h-2.5 rounded-full bg-primary" /></div></div>;

  return (
    <div className="space-y-6">
      <div className="glass rounded-xl p-4 space-y-3">
        <p className="text-sm font-semibold text-foreground">Novo departamento</p>
        <div className="flex items-center gap-3">
          <Input placeholder="Nome do departamento" value={newName} onChange={e => setNewName(e.target.value)} className="flex-1" />
          <div className="flex gap-1">{PRESET_COLORS.map(c => (<button key={c} onClick={() => setNewColor(c)} className={`w-6 h-6 rounded-full border-2 transition-transform ${newColor === c ? "border-foreground scale-110" : "border-transparent"}`} style={{ backgroundColor: c }} />))}</div>
          <Button size="sm" onClick={handleCreate} disabled={!newName.trim()}><Plus className="w-4 h-4 mr-1" /> Criar</Button>
        </div>
      </div>
      <div className="space-y-2">
        {departments.map(dept => (
          <div key={dept.id} className="glass rounded-xl p-4 flex items-center gap-4">
            <div className="w-8 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: dept.color }} />
            <div className="flex-1 min-w-0"><p className="text-sm font-medium text-foreground">{dept.name}</p><p className="text-[11px] text-muted-foreground">{dept.user_count || 0} usuário(s)</p></div>
            {editingId === dept.id ? (
              <div className="flex items-center gap-1">
                {PRESET_COLORS.map(c => (<button key={c} onClick={() => setEditColor(c)} className={`w-5 h-5 rounded-full border-2 transition-transform ${editColor === c ? "border-foreground scale-110" : "border-transparent"}`} style={{ backgroundColor: c }} />))}
                <Button size="sm" variant="outline" className="h-7 ml-1" onClick={() => handleUpdateColor(dept.id)}>✓</Button>
                <Button size="sm" variant="ghost" className="h-7" onClick={() => setEditingId(null)}>✕</Button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Button size="sm" variant="ghost" className="h-8" onClick={() => { setEditingId(dept.id); setEditColor(dept.color); }} title="Mudar cor"><Palette className="w-3.5 h-3.5" /></Button>
                <Button size="sm" variant="ghost" className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(dept)} title="Apagar"><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDepartmentsTab;
