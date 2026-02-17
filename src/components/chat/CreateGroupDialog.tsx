import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Profile } from "@/hooks/useChat";

const CreateGroupDialog = ({ contacts, onClose, onCreate }: { contacts: Profile[]; onClose: () => void; onCreate: (name: string, memberIds: string[]) => Promise<void>; }) => {
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const toggle = (id: string) => setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const handleCreate = async () => { if (!name.trim() || selected.length === 0) return; setLoading(true); await onCreate(name.trim(), selected); setLoading(false); onClose(); };
  const initials = (n: string) => n.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm fade-in">
      <div className="glass-strong rounded-2xl w-full max-w-md p-6 space-y-4 animate-in mx-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-foreground">Novo Grupo</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-secondary/50 text-muted-foreground"><X className="w-5 h-5" /></button>
        </div>
        <Input placeholder="Nome do grupo" value={name} onChange={(e) => setName(e.target.value)} className="bg-secondary/50 border-border/50" />
        <div className="max-h-60 overflow-y-auto space-y-1">
          <p className="text-xs text-muted-foreground font-medium mb-2">Selecionar membros:</p>
          {contacts.map((c) => (
            <button key={c.user_id} onClick={() => toggle(c.user_id)}
              className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${selected.includes(c.user_id) ? "bg-primary/10 border border-primary/20" : "hover:bg-secondary/50"}`}>
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-medium">{initials(c.display_name)}</div>
              <div className="text-left"><p className="text-sm text-foreground">{c.display_name}</p><p className="text-xs text-muted-foreground">{c.department}</p></div>
            </button>
          ))}
        </div>
        <Button onClick={handleCreate} disabled={!name.trim() || selected.length === 0 || loading} className="w-full">{loading ? "Criando..." : `Criar grupo (${selected.length} membros)`}</Button>
      </div>
    </div>
  );
};

export default CreateGroupDialog;
