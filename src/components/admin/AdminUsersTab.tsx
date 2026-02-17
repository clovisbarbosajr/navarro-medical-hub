import { useState, useEffect, useCallback } from "react";
import { UserPlus, Trash2, Key, ArrowRightLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useChatAuth } from "@/contexts/ChatAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface UserRow { user_id: string; display_name: string; department: string; is_online: boolean; last_seen: string | null; avatar_url: string | null; }
interface Department { id: string; name: string; color: string; }

const AdminUsersTab = () => {
  const { user } = useChatAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newDept, setNewDept] = useState("Geral");
  const [creating, setCreating] = useState(false);
  const [resetUserId, setResetUserId] = useState<string | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const [changeDeptUserId, setChangeDeptUserId] = useState<string | null>(null);
  const [changeDeptValue, setChangeDeptValue] = useState("");

  const callAdmin = async (body: any) => {
    const { data: session } = await supabase.auth.getSession();
    return fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-manage`, {
      method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.session?.access_token}` },
      body: JSON.stringify(body),
    });
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [{ data: usersData }, { data: deptsData }] = await Promise.all([
      supabase.from("user_profiles").select("user_id, display_name, department, is_online, last_seen, avatar_url").order("display_name"),
      supabase.from("departments").select("id, name, color").order("name"),
    ]);
    if (usersData) setUsers(usersData);
    if (deptsData) setDepartments(deptsData);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreate = async () => {
    if (!newName.trim() || !newPassword.trim()) return;
    setCreating(true);
    const res = await callAdmin({ action: "create_user", displayName: newName.trim(), password: newPassword, department: newDept });
    const result = await res.json();
    setCreating(false);
    if (res.ok) { toast({ title: "Usuário criado", description: `${newName} adicionado ao departamento ${newDept}.` }); setNewName(""); setNewPassword(""); setNewDept("Geral"); setShowCreate(false); fetchData(); }
    else { toast({ title: "Erro", description: result.error, variant: "destructive" }); }
  };

  const handleDelete = async (userId: string, name: string) => {
    if (!confirm(`Apagar o usuário "${name}" e TODAS as suas mensagens permanentemente?`)) return;
    const res = await callAdmin({ action: "delete_user", userId });
    if (res.ok) { toast({ title: "Usuário apagado", description: `${name} foi removido.` }); fetchData(); }
    else { const result = await res.json(); toast({ title: "Erro", description: result.error, variant: "destructive" }); }
  };

  const handleResetPassword = async () => {
    if (!resetUserId || !resetPassword.trim()) return;
    const res = await callAdmin({ action: "reset_password", userId: resetUserId, newPassword: resetPassword });
    if (res.ok) { toast({ title: "Senha redefinida" }); setResetUserId(null); setResetPassword(""); }
    else { const result = await res.json(); toast({ title: "Erro", description: result.error, variant: "destructive" }); }
  };

  const handleChangeDept = async () => {
    if (!changeDeptUserId || !changeDeptValue) return;
    const res = await callAdmin({ action: "update_user_department", userId: changeDeptUserId, department: changeDeptValue });
    if (res.ok) { toast({ title: "Departamento atualizado" }); setChangeDeptUserId(null); setChangeDeptValue(""); fetchData(); }
    else { const result = await res.json(); toast({ title: "Erro", description: result.error, variant: "destructive" }); }
  };

  const initials = (name: string) => name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  const getDeptColor = (dept: string) => departments.find(dd => dd.name === dept)?.color || "#14b8a6";

  if (loading) return <div className="flex justify-center py-12"><div className="flex gap-1.5"><span className="typing-dot w-2.5 h-2.5 rounded-full bg-primary" /><span className="typing-dot w-2.5 h-2.5 rounded-full bg-primary" /><span className="typing-dot w-2.5 h-2.5 rounded-full bg-primary" /></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{users.length} usuários cadastrados</p>
        <Button size="sm" onClick={() => setShowCreate(!showCreate)}><UserPlus className="w-4 h-4 mr-1.5" /> Novo usuário</Button>
      </div>
      {showCreate && (
        <div className="glass rounded-xl p-4 space-y-3 animate-in">
          <p className="text-sm font-semibold text-foreground">Criar novo usuário</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input placeholder="Nome completo" value={newName} onChange={e => setNewName(e.target.value)} />
            <Input placeholder="Senha" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            <Select value={newDept} onValueChange={setNewDept}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{departments.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}</SelectContent></Select>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleCreate} disabled={creating || !newName.trim() || !newPassword.trim()}>{creating ? "Criando..." : "Criar"}</Button>
            <Button size="sm" variant="ghost" onClick={() => setShowCreate(false)}>Cancelar</Button>
          </div>
        </div>
      )}
      <div className="space-y-2">
        {users.map(u => (
          <div key={u.user_id} className="glass rounded-xl p-4 flex items-center gap-4">
            <div className="relative flex-shrink-0">
              {u.avatar_url ? <img src={u.avatar_url} alt={u.display_name} className="w-10 h-10 rounded-full object-cover" /> : <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: getDeptColor(u.department) }}>{initials(u.display_name)}</div>}
              <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${u.is_online ? "bg-green-500" : "bg-muted-foreground/40"}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{u.display_name}</p>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: getDeptColor(u.department) }}>{u.department}</span>
                {u.last_seen && !u.is_online && <span className="text-[10px] text-muted-foreground">Visto {new Date(u.last_seen).toLocaleDateString("pt-BR")}</span>}
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {changeDeptUserId === u.user_id ? (
                <div className="flex items-center gap-1">
                  <Select value={changeDeptValue} onValueChange={setChangeDeptValue}><SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue placeholder="Departamento" /></SelectTrigger><SelectContent>{departments.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}</SelectContent></Select>
                  <Button size="sm" variant="outline" className="h-8" onClick={handleChangeDept} disabled={!changeDeptValue}>✓</Button>
                  <Button size="sm" variant="ghost" className="h-8" onClick={() => setChangeDeptUserId(null)}>✕</Button>
                </div>
              ) : <Button size="sm" variant="ghost" className="h-8" onClick={() => { setChangeDeptUserId(u.user_id); setChangeDeptValue(u.department); }} title="Mudar departamento"><ArrowRightLeft className="w-3.5 h-3.5" /></Button>}
              {resetUserId === u.user_id ? (
                <div className="flex items-center gap-1">
                  <Input className="w-[120px] h-8 text-xs" type="password" placeholder="Nova senha" value={resetPassword} onChange={e => setResetPassword(e.target.value)} />
                  <Button size="sm" variant="outline" className="h-8" onClick={handleResetPassword} disabled={!resetPassword.trim()}>✓</Button>
                  <Button size="sm" variant="ghost" className="h-8" onClick={() => setResetUserId(null)}>✕</Button>
                </div>
              ) : <Button size="sm" variant="ghost" className="h-8" onClick={() => setResetUserId(u.user_id)} title="Redefinir senha"><Key className="w-3.5 h-3.5" /></Button>}
              {u.user_id !== user?.id && <Button size="sm" variant="ghost" className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(u.user_id, u.display_name)} title="Apagar usuário"><Trash2 className="w-3.5 h-3.5" /></Button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminUsersTab;
