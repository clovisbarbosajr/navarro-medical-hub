import { supabase } from "@/integrations/supabase/client";

type AuditAction = "criou" | "editou" | "deletou" | "ativou" | "desativou";
type EntityType = "notícia" | "aviso" | "aniversariante" | "campanha" | "tema" | "link" | "configuração" | "evento";

export const logAction = async (
  action: AuditAction,
  entityType: EntityType,
  entityTitle?: string
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await (supabase as any).from("audit_log").insert({
      user_id: user.id,
      user_email: user.email,
      action,
      entity_type: entityType,
      entity_title: entityTitle || null,
    });
  } catch {
    // Silent fail — don't break the app for logging
  }
};
