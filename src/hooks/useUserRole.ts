import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useChatAuth } from "@/contexts/ChatAuthContext";

export const useUserRole = () => {
  const { user } = useChatAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkRole = useCallback(async () => {
    if (!user) { setIsAdmin(false); setLoading(false); return; }
    const { data } = await (supabase as any)
      .from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
    setIsAdmin(!!data);
    setLoading(false);
  }, [user]);

  useEffect(() => { checkRole(); }, [checkRole]);
  return { isAdmin, loading };
};
