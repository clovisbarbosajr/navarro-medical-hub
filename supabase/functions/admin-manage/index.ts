import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return new Response(JSON.stringify({ error: "No auth" }), { status: 401, headers: corsHeaders });

  const anonClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );
  const { data: { user }, error: authError } = await anonClient.auth.getUser();
  if (authError || !user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

  const { data: roleData } = await supabaseAdmin
    .from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
  if (!roleData) return new Response(JSON.stringify({ error: "Admin access required" }), { status: 403, headers: corsHeaders });

  const body = await req.json();
  const { action } = body;

  try {
    if (action === "create_user") {
      const { displayName, password, department } = body;
      if (!displayName || !password) {
        return new Response(JSON.stringify({ error: "Nome e senha são obrigatórios" }), { status: 400, headers: corsHeaders });
      }
      const email = displayName.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, ".").replace(/[^a-z0-9.]/g, "") + "@navarro.com";

      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email, password, email_confirm: true,
        user_metadata: { display_name: displayName },
      });
      if (createError) {
        if (createError.message.includes("already been registered")) {
          return new Response(JSON.stringify({ error: "Usuário já existe" }), { status: 409, headers: corsHeaders });
        }
        return new Response(JSON.stringify({ error: createError.message }), { status: 500, headers: corsHeaders });
      }
      if (department && newUser.user) {
        await supabaseAdmin.from("user_profiles").update({ display_name: displayName, department }).eq("user_id", newUser.user.id);
      }
      return new Response(JSON.stringify({ userId: newUser.user?.id }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "delete_user") {
      const { userId } = body;
      if (!userId) return new Response(JSON.stringify({ error: "userId obrigatório" }), { status: 400, headers: corsHeaders });
      if (userId === user.id) return new Response(JSON.stringify({ error: "Não pode deletar a si mesmo" }), { status: 400, headers: corsHeaders });
      await supabaseAdmin.from("chat_reactions").delete().eq("user_id", userId);
      await supabaseAdmin.from("chat_messages").delete().eq("sender_id", userId);
      await supabaseAdmin.from("chat_participants").delete().eq("user_id", userId);
      await supabaseAdmin.from("user_roles").delete().eq("user_id", userId);
      await supabaseAdmin.from("user_profiles").delete().eq("user_id", userId);
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (deleteError) return new Response(JSON.stringify({ error: deleteError.message }), { status: 500, headers: corsHeaders });
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "reset_password") {
      const { userId, newPassword } = body;
      if (!userId || !newPassword) return new Response(JSON.stringify({ error: "userId e newPassword obrigatórios" }), { status: 400, headers: corsHeaders });
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, { password: newPassword });
      if (updateError) return new Response(JSON.stringify({ error: updateError.message }), { status: 500, headers: corsHeaders });
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "update_user_department") {
      const { userId, department } = body;
      if (!userId || !department) return new Response(JSON.stringify({ error: "userId e department obrigatórios" }), { status: 400, headers: corsHeaders });
      const { error } = await supabaseAdmin.from("user_profiles").update({ department }).eq("user_id", userId);
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "broadcast_message") {
      const { content, targetDepartment, isAttention } = body;
      if (!content) return new Response(JSON.stringify({ error: "Conteúdo obrigatório" }), { status: 400, headers: corsHeaders });
      let query = supabaseAdmin.from("user_profiles").select("user_id");
      if (targetDepartment && targetDepartment !== "all") {
        query = query.eq("department", targetDepartment);
      }
      const { data: targetUsers } = await query;
      if (!targetUsers?.length) return new Response(JSON.stringify({ error: "Nenhum usuário encontrado" }), { status: 404, headers: corsHeaders });

      let sentCount = 0;
      for (const target of targetUsers) {
        if (target.user_id === user.id) continue;
        let convId: string | null = null;
        const { data: myConvs } = await supabaseAdmin.from("chat_participants").select("conversation_id").eq("user_id", user.id);
        if (myConvs) {
          for (const mc of myConvs) {
            const { data: conv } = await supabaseAdmin.from("chat_conversations").select("id, type").eq("id", mc.conversation_id).eq("type", "direct").maybeSingle();
            if (conv) {
              const { data: otherPart } = await supabaseAdmin.from("chat_participants").select("user_id").eq("conversation_id", conv.id).eq("user_id", target.user_id).maybeSingle();
              if (otherPart) { convId = conv.id; break; }
            }
          }
        }
        if (!convId) {
          const { data: newConv } = await supabaseAdmin.from("chat_conversations").insert({ type: "direct", created_by: user.id }).select("id").single();
          if (newConv) {
            await supabaseAdmin.from("chat_participants").insert([
              { conversation_id: newConv.id, user_id: user.id },
              { conversation_id: newConv.id, user_id: target.user_id },
            ]);
            convId = newConv.id;
          }
        }
        if (convId) {
          await supabaseAdmin.from("chat_messages").insert({ conversation_id: convId, sender_id: user.id, content, is_attention: isAttention || false });
          await supabaseAdmin.from("chat_conversations").update({ updated_at: new Date().toISOString() }).eq("id", convId);
          sentCount++;
        }
      }
      return new Response(JSON.stringify({ success: true, sentCount }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "delete_conversation_messages") {
      const { conversationId } = body;
      if (!conversationId) return new Response(JSON.stringify({ error: "conversationId obrigatório" }), { status: 400, headers: corsHeaders });
      const { data: msgs } = await supabaseAdmin.from("chat_messages").select("id").eq("conversation_id", conversationId);
      if (msgs?.length) {
        const msgIds = msgs.map(m => m.id);
        await supabaseAdmin.from("chat_reactions").delete().in("message_id", msgIds);
      }
      await supabaseAdmin.from("chat_messages").delete().eq("conversation_id", conversationId);
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400, headers: corsHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: corsHeaders });
  }
});
