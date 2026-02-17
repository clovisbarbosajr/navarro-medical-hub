import { X, MessageCircle } from "lucide-react";

interface Tab { id: string; name: string; unread: number; hasNewMessage: boolean; hasAttention?: boolean; }

const ConversationTabs = ({ tabs, activeId, onSelect, onClose }: { tabs: Tab[]; activeId?: string; onSelect: (id: string) => void; onClose: (id: string) => void; }) => {
  if (tabs.length === 0) return null;
  return (
    <div className="flex items-center gap-0.5 p-1 overflow-x-auto border-b border-border/30 bg-secondary/20">
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <div key={tab.id} className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm cursor-pointer transition-all whitespace-nowrap ${isActive ? "bg-primary/15 text-primary border border-primary/20" : tab.hasAttention ? "tab-blink-attention text-destructive hover:bg-secondary/50" : tab.hasNewMessage ? "tab-blink text-accent hover:bg-secondary/50" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"}`} onClick={() => onSelect(tab.id)}>
            <MessageCircle className="w-3.5 h-3.5" />
            <span className="max-w-[120px] truncate">{tab.name}</span>
            {tab.unread > 0 && <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-semibold">{tab.unread}</span>}
            <button onClick={(e) => { e.stopPropagation(); onClose(tab.id); }} className="ml-0.5 p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-secondary/80 transition-all"><X className="w-3 h-3" /></button>
          </div>
        );
      })}
    </div>
  );
};

export default ConversationTabs;
