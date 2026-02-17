import { useState, useEffect, useCallback } from "react";
import { SmilePlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useChatAuth } from "@/contexts/ChatAuthContext";

const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥", "🎉", "✅", "👎", "🙏"];

interface Reaction { emoji: string; count: number; users: string[]; reacted: boolean; }

const MessageReactions = ({ messageId }: { messageId: string }) => {
  const { user } = useChatAuth();
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [showPicker, setShowPicker] = useState(false);

  const fetchReactions = useCallback(async () => {
    const { data } = await (supabase as any).from("chat_reactions").select("emoji, user_id").eq("message_id", messageId);
    if (!data) return;
    const map = new Map<string, { count: number; users: string[]; reacted: boolean }>();
    data.forEach((r: any) => {
      const existing = map.get(r.emoji) || { count: 0, users: [], reacted: false };
      existing.count++; existing.users.push(r.user_id);
      if (r.user_id === user?.id) existing.reacted = true;
      map.set(r.emoji, existing);
    });
    setReactions(Array.from(map.entries()).map(([emoji, info]) => ({ emoji, ...info })));
  }, [messageId, user?.id]);

  useEffect(() => { fetchReactions(); }, [fetchReactions]);
  useEffect(() => {
    const channel = supabase.channel(`reactions-${messageId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_reactions", filter: `message_id=eq.${messageId}` }, () => fetchReactions())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [messageId, fetchReactions]);

  const toggleReaction = async (emoji: string) => {
    if (!user) return;
    const existing = reactions.find((r) => r.emoji === emoji);
    if (existing?.reacted) {
      await (supabase as any).from("chat_reactions").delete().eq("message_id", messageId).eq("user_id", user.id).eq("emoji", emoji);
    } else {
      await (supabase as any).from("chat_reactions").insert({ message_id: messageId, user_id: user.id, emoji });
    }
    setShowPicker(false);
  };

  return (
    <div className="flex items-center gap-0.5 flex-wrap mt-0.5 relative">
      {reactions.map((r) => (
        <button key={r.emoji} onClick={() => toggleReaction(r.emoji)}
          className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] transition-all border ${r.reacted ? "bg-primary/15 border-primary/30 text-primary" : "bg-secondary/30 border-border/20 text-muted-foreground hover:bg-secondary/50"}`}>
          <span className="text-xs">{r.emoji}</span><span className="font-semibold">{r.count}</span>
        </button>
      ))}
      <div className="relative">
        <button onClick={() => setShowPicker(!showPicker)} className="p-0.5 rounded-full text-muted-foreground/40 hover:text-muted-foreground hover:bg-secondary/30 transition-all opacity-0 group-hover:opacity-100">
          <SmilePlus className="w-3.5 h-3.5" />
        </button>
        {showPicker && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowPicker(false)} />
            <div className="absolute bottom-6 left-0 z-50 flex gap-0.5 p-1.5 rounded-lg bg-popover border border-border shadow-lg animate-in">
              {REACTION_EMOJIS.map((emoji) => (
                <button key={emoji} onClick={() => toggleReaction(emoji)} className="text-sm hover:scale-125 transition-transform p-0.5">{emoji}</button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MessageReactions;
