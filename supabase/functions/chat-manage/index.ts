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

  const { data: { user }, error: authError } = await createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  ).auth.getUser();

  if (authError || !user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

  const { action, otherUserId, name, memberIds } = await req.json();

  if (action === "start_direct") {
    const { data: myConvs } = await supabaseAdmin
      .from("chat_participants").select("conversation_id").eq("user_id", user.id);

    if (myConvs?.length) {
      for (const mc of myConvs) {
        const { data: conv } = await supabaseAdmin
          .from("chat_conversations").select("id, type")
          .eq("id", mc.conversation_id).eq("type", "direct").maybeSingle();
        if (conv) {
          const { data: otherPart } = await supabaseAdmin
            .from("chat_participants").select("user_id")
            .eq("conversation_id", conv.id).eq("user_id", otherUserId).maybeSingle();
          if (otherPart) return new Response(JSON.stringify({ conversationId: conv.id }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
      }
    }

    const { data: newConv, error } = await supabaseAdmin
      .from("chat_conversations").insert({ type: "direct", created_by: user.id }).select("id").single();
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });

    await supabaseAdmin.from("chat_participants").insert([
      { conversation_id: newConv.id, user_id: user.id },
      { conversation_id: newConv.id, user_id: otherUserId },
    ]);

    return new Response(JSON.stringify({ conversationId: newConv.id }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  if (action === "create_group") {
    const { data: newConv, error } = await supabaseAdmin
      .from("chat_conversations").insert({ type: "group", name, created_by: user.id }).select("id").single();
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });

    const participants = [user.id, ...memberIds].map((uid: string) => ({
      conversation_id: newConv.id, user_id: uid,
    }));
    await supabaseAdmin.from("chat_participants").insert(participants);

    return new Response(JSON.stringify({ conversationId: newConv.id }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400, headers: corsHeaders });
});
