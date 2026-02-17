import { useState, useCallback, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import FlowFieldBackground from "@/components/FlowFieldBackground";
import ChatSidebar from "@/components/ChatSidebar";
import ChatArea from "@/components/ChatArea";
import ConversationTabs from "@/components/ConversationTabs";
import CreateGroupDialog from "@/components/chat/CreateGroupDialog";
import { useChat } from "@/hooks/useChat";
import { useChatAuth } from "@/contexts/ChatAuthContext";

const ChatPage = () => {
  const { user } = useChatAuth();
  const { contacts, conversations, loading, fetchMessages, sendMessage, markAsRead, startDirectConversation, createGroupConversation } = useChat();
  const [openTabs, setOpenTabs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>();
  const [showGroupDialog, setShowGroupDialog] = useState(false);

  const openConversation = useCallback((id: string) => { setOpenTabs((prev) => (prev.includes(id) ? prev : [...prev, id])); setActiveTab(id); }, []);
  const closeTab = useCallback((id: string) => { setOpenTabs((prev) => { const next = prev.filter((t) => t !== id); if (activeTab === id) setActiveTab(next[next.length - 1]); return next; }); }, [activeTab]);
  const handleStartDirect = useCallback(async (userId: string) => { const convId = await startDirectConversation(userId); openConversation(convId); }, [startDirectConversation, openConversation]);
  const handleCreateGroup = useCallback(async (name: string, memberIds: string[]) => { const convId = await createGroupConversation(name, memberIds); openConversation(convId); }, [createGroupConversation, openConversation]);

  const getConversationName = (id: string) => {
    const conv = conversations.find((c) => c.id === id);
    if (!conv) return "...";
    if (conv.type === "group") return conv.name || "Grupo";
    return conv.participants.find((p) => p.user_id !== user?.id)?.display_name || "Conversa";
  };

  const tabs = openTabs.map((id) => { const conv = conversations.find((c) => c.id === id); return { id, name: getConversationName(id), unread: conv?.unread_count || 0, hasNewMessage: (conv?.unread_count || 0) > 0 && id !== activeTab }; });

  useEffect(() => { const total = conversations.reduce((sum, c) => sum + c.unread_count, 0); document.title = total > 0 ? `(${total}) Navarro Connect` : "Navarro Connect"; }, [conversations]);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <FlowFieldBackground />
      <div className="relative z-10 flex h-full">
        <ChatSidebar contacts={contacts} conversations={conversations} activeConversationId={activeTab} onSelectConversation={openConversation} onStartDirect={handleStartDirect} onCreateGroup={() => setShowGroupDialog(true)} />
        <div className="flex-1 flex flex-col min-w-0">
          <ConversationTabs tabs={tabs} activeId={activeTab} onSelect={(id) => { setActiveTab(id); markAsRead(id); }} onClose={closeTab} />
          {activeTab ? <ChatArea key={activeTab} conversationId={activeTab} conversationName={getConversationName(activeTab)} fetchMessages={fetchMessages} sendMessage={sendMessage} markAsRead={markAsRead} /> : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4 animate-in">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto"><MessageCircle className="w-10 h-10 text-primary" /></div>
                <div><h2 className="text-2xl font-display font-bold gradient-text">Navarro Connect</h2><p className="text-muted-foreground text-sm mt-1">Selecione uma conversa ou inicie uma nova</p></div>
              </div>
            </div>
          )}
        </div>
      </div>
      {showGroupDialog && <CreateGroupDialog contacts={contacts} onClose={() => setShowGroupDialog(false)} onCreate={handleCreateGroup} />}
    </div>
  );
};

export default ChatPage;
