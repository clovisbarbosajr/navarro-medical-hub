import { useState } from "react";
import { ArrowLeft, History, Users, Building2, Megaphone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useChatAuth } from "@/contexts/ChatAuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import AdminHistoryTab from "@/components/admin/AdminHistoryTab";
import AdminUsersTab from "@/components/admin/AdminUsersTab";
import AdminDepartmentsTab from "@/components/admin/AdminDepartmentsTab";
import AdminBroadcastTab from "@/components/admin/AdminBroadcastTab";

const TABS = [
  { id: "history", label: "Histórico", icon: History },
  { id: "users", label: "Usuários", icon: Users },
  { id: "departments", label: "Departamentos", icon: Building2 },
  { id: "broadcast", label: "Broadcast", icon: Megaphone },
] as const;

type TabId = typeof TABS[number]["id"];

const AdminPage = () => {
  const navigate = useNavigate();
  const { user } = useChatAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [activeTab, setActiveTab] = useState<TabId>("history");

  if (roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex gap-1.5">
          <span className="typing-dot w-2.5 h-2.5 rounded-full bg-primary" />
          <span className="typing-dot w-2.5 h-2.5 rounded-full bg-primary" />
          <span className="typing-dot w-2.5 h-2.5 rounded-full bg-primary" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <p className="text-destructive font-semibold">Acesso negado</p>
          <Button variant="outline" onClick={() => navigate("/")}>Voltar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/30 bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-display font-bold gradient-text">Painel Administrativo</h1>
          </div>
        </div>
      </header>
      <div className="border-b border-border/30 bg-background/50">
        <div className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${isActive ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"}`}>
                <Icon className="w-4 h-4" />{tab.label}
              </button>
            );
          })}
        </div>
      </div>
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === "history" && <AdminHistoryTab />}
        {activeTab === "users" && <AdminUsersTab />}
        {activeTab === "departments" && <AdminDepartmentsTab />}
        {activeTab === "broadcast" && <AdminBroadcastTab />}
      </main>
    </div>
  );
};

export default AdminPage;
