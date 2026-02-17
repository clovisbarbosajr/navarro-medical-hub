import { X, MessageCircle, AlertTriangle } from "lucide-react";

interface Tab { id: string; name: string; unread: number; hasNewMessage: boolean; hasAttention: boolean; }

const ChatWidgetTabs = ({ tabs, activeId, onSelect, onClose }: { tabs: Tab[]; activeId?: string; onSelect: (id: string) => void; onClose: (id: string) => void; }) => {
  if (tabs.length === 0) return null;
  return (
    <div className="flex items-center gap-0.5 px-1 py-0.5 overflow-x-auto border-b border-border/30 bg-secondary/10">
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        const blinkClass = !isActive && tab.hasAttention ? "tab-blink-attention" : !isActive && tab.hasNewMessage ? "tab-blink" : "";
        return (
          <div key={tab.id} className={`group flex items-center gap-1 px-2 py-1 rounded-md text-[10px] cursor-pointer transition-all whitespace-nowrap ${isActive ? "bg-primary/15 text-primary border border-primary/20" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"} ${blinkClass}`} onClick={() => onSelect(tab.id)}>
            {tab.hasAttention && !isActive ? <AlertTriangle className="w-2.5 h-2.5 text-destructive" /> : <MessageCircle className="w-2.5 h-2.5" />}
            <span className="max-w-[80px] truncate">{tab.name}</span>
            {tab.unread > 0 && <span className={`w-3.5 h-3.5 rounded-full text-[8px] flex items-center justify-center font-bold ${tab.hasAttention ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground"}`}>{tab.unread}</span>}
            <button onClick={(e) => { e.stopPropagation(); onClose(tab.id); }} className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-secondary/80 transition-all"><X className="w-2.5 h-2.5" /></button>
          </div>
        );
      })}
    </div>
  );
};

export default ChatWidgetTabs;
