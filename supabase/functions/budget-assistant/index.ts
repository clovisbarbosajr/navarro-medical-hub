import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TOOLS = [
  {
    type: "function",
    function: {
      name: "update_procedure",
      description: "Atualiza o nome ou preço de um procedimento existente na base de dados. Use quando o admin pedir para alterar um valor ou nome.",
      parameters: {
        type: "object",
        properties: {
          code: { type: "string", description: "Código do procedimento a ser atualizado" },
          new_name: { type: "string", description: "Novo nome do procedimento (opcional)" },
          new_price: { type: "number", description: "Novo preço do procedimento (opcional)" },
        },
        required: ["code"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_procedure",
      description: "Adiciona um novo procedimento à base de dados.",
      parameters: {
        type: "object",
        properties: {
          code: { type: "string", description: "Código do novo procedimento" },
          name: { type: "string", description: "Nome do procedimento" },
          price: { type: "number", description: "Preço do procedimento" },
          category: { type: "string", description: "Categoria: individual ou package" },
          package_name: { type: "string", description: "Nome do pacote (se aplicável)" },
        },
        required: ["code", "name", "price"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_procedure",
      description: "Remove um procedimento da base de dados pelo código.",
      parameters: {
        type: "object",
        properties: {
          code: { type: "string", description: "Código do procedimento a ser removido" },
        },
        required: ["code"],
        additionalProperties: false,
      },
    },
  },
];

async function checkIsEditor(supabase: any, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .single();
  return data?.role === "admin" || data?.role === "manager";
}

async function executeTool(supabase: any, name: string, args: any): Promise<string> {
  if (name === "update_procedure") {
    const updates: any = {};
    if (args.new_name) updates.name = args.new_name;
    if (args.new_price !== undefined) updates.price = args.new_price;
    if (Object.keys(updates).length === 0) return "Nenhum campo para atualizar foi informado.";

    const { data, error } = await supabase
      .from("procedures")
      .update(updates)
      .eq("code", args.code)
      .select();

    if (error) return `Erro ao atualizar: ${error.message}`;
    if (!data || data.length === 0) return `Procedimento com código "${args.code}" não encontrado.`;
    return `✅ Procedimento "${data[0].name}" (${args.code}) atualizado com sucesso. ${args.new_price !== undefined ? `Novo preço: $${args.new_price}` : ""} ${args.new_name ? `Novo nome: ${args.new_name}` : ""}`.trim();
  }

  if (name === "add_procedure") {
    const { error } = await supabase
      .from("procedures")
      .insert({
        code: args.code,
        name: args.name,
        price: args.price,
        category: args.category || "individual",
        package_name: args.package_name || null,
      });

    if (error) return `Erro ao adicionar: ${error.message}`;
    return `✅ Procedimento "${args.name}" (${args.code}) adicionado com sucesso. Preço: $${args.price}`;
  }

  if (name === "delete_procedure") {
    const { data, error } = await supabase
      .from("procedures")
      .delete()
      .eq("code", args.code)
      .select();

    if (error) return `Erro ao remover: ${error.message}`;
    if (!data || data.length === 0) return `Procedimento com código "${args.code}" não encontrado.`;
    return `✅ Procedimento "${data[0].name}" (${args.code}) removido com sucesso.`;
  }

  return "Ferramenta desconhecida.";
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if user is admin/manager
    let isEditor = false;
    const authHeader = req.headers.get("authorization") || "";
    if (authHeader.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      // Try to get user from token (skip if it's just the anon key)
      try {
        const { data: { user } } = await supabase.auth.getUser(token);
        if (user) {
          isEditor = await checkIsEditor(supabase, user.id);
        }
      } catch { /* not logged in, that's fine */ }
    }

    // Fetch procedures
    const { data: procedures } = await supabase
      .from("procedures")
      .select("code, name, price, category, package_name")
      .order("name");

    const proceduresList = (procedures || [])
      .map((p: any) => `${p.code} | ${p.name} | $${p.price}${p.package_name ? ` | Pacote: ${p.package_name}` : ""} | Cat: ${p.category}`)
      .join("\n");

    let systemPrompt = `Você é o Clovis (menino do computador), assistente virtual de orçamentos da Navarro Medical.

REGRAS IMPORTANTES:
1. Responda SEMPRE em português do Brasil
2. Seja objetiva e profissional
3. Quando o usuário colar uma lista de procedimentos (geralmente com códigos numéricos e nomes), identifique cada um na base de dados e calcule o orçamento
4. Apresente cada item encontrado em uma tabela formatada com: Código | Nome | Valor
5. Ao final, mostre o TOTAL
6. Se um procedimento não for encontrado na base, avise o usuário
7. Pacientes do PLANO NAVARRO têm 15% de desconto no valor final dos exames laboratoriais e 30% de desconto nas consultas com Dr Denise e Ana Pinon
8. Quando perguntarem sobre consultas com médicos específicos, busque na base
9. CONSULTAS MÉDICAS — Quando o usuário perguntar sobre consulta sem especificar médico, SEMPRE liste TODOS os médicos no formato abaixo (NÃO use tabela markdown, use o formato de lista abaixo):

🩺 **Consulta Geral**
- Especialidade: Clínica Geral
- Valor: **$200**
- Inclui 1 retorno em 30 dias

---

👩‍⚕️ **Dr Denise**
- Especialidade: Wellness, HRT, Dermatologia
- Valor: **$400**
- Inclui 1 retorno em 30 dias

---

🧠 **Dr Ana Pinon**
- Especialidade: Psiquiatria
- 1ª consulta: **$250**
- Acompanhamento: **$150**

---

💡 **Desconto Plano Navarro:** 30% de desconto nas consultas com Dr Denise e Dr Ana Pinon.

IMPORTANTE: Use EXATAMENTE esse formato com emojis e separadores (---). NUNCA use tabela markdown para listar consultas.
10. NÃO invente valores. Se não encontrar, diga que o procedimento não está na base
11. Quando o usuário colar texto com procedimentos, podem vir em formatos variados (com ou sem código). Faça o matching pelo nome ou código
14. Valores estão em USD ($)

BASE DE DADOS DE PROCEDIMENTOS:
${proceduresList}

PACOTES DISPONÍVEIS (preços totais do pacote):
- 001 Annual Private (W&M): $160.00
- 002 Private Hormone Male: $203.25
- 003 Private Hormone Female: $210.75
- 004.1 Private Dermatology (Tissue Pathology): $93.00
- 004.2 Private Dermatology/Roaccutan: $175.11
- 005 Private Anemia: $121.89
- 006 Private Autoimmune: $359.06
- 007 Private Pediatric: $245.00
- 008 Private PRE-OP: $60.00
- 009 Private WL + VITAMINS: (soma dos itens individuais)
- Private Adrenal: $160.35
- Private Gastrointestinal: $1,299.09
- Private Diabetes: $538.89

Quando o usuário colar uma lista, faça o matching inteligente considerando variações de nome e código. Apresente o resultado de forma clara e organizada.`;

    if (isEditor) {
      systemPrompt += `

🔧 MODO ADMINISTRADOR ATIVO:
Você tem permissão para ALTERAR a base de dados de procedimentos. O usuário pode pedir para:
- Atualizar o preço de um procedimento (use a ferramenta update_procedure)
- Alterar o nome de um procedimento (use a ferramenta update_procedure)
- Adicionar um novo procedimento (use a ferramenta add_procedure)
- Remover um procedimento (use a ferramenta delete_procedure)

Quando o usuário pedir para alterar algo, use a ferramenta correspondente. Confirme a alteração feita ao usuário.
Se o usuário não especificar o código, procure o procedimento pelo nome na base acima e use o código correto.
SEMPRE confirme o que vai ser alterado antes de executar (ex: "Vou alterar o preço do procedimento X de $Y para $Z. Confirma?"). Se o usuário confirmar, execute a ferramenta.`;
    }

    const aiMessages = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    // If admin, use tool calling (non-streaming first to handle tools)
    if (isEditor) {
      const toolResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: aiMessages,
          tools: TOOLS,
          stream: false,
        }),
      });

      if (!toolResponse.ok) {
        const status = toolResponse.status;
        if (status === 429) return new Response(JSON.stringify({ error: "Muitas solicitações. Tente novamente em instantes." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        if (status === 402) return new Response(JSON.stringify({ error: "Créditos insuficientes." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        return new Response(JSON.stringify({ error: "Erro no serviço de IA" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const toolResult = await toolResponse.json();
      const choice = toolResult.choices?.[0];

      // If no tool calls, stream the content directly
      if (!choice?.message?.tool_calls || choice.message.tool_calls.length === 0) {
        // Return the text response as a streaming-compatible SSE
        const content = choice?.message?.content || "Não consegui processar sua solicitação.";
        const sseData = `data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\ndata: [DONE]\n\n`;
        return new Response(sseData, {
          headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
        });
      }

      // Execute tool calls
      const toolCallResults: any[] = [];
      for (const tc of choice.message.tool_calls) {
        const args = typeof tc.function.arguments === "string" ? JSON.parse(tc.function.arguments) : tc.function.arguments;
        const result = await executeTool(supabase, tc.function.name, args);
        toolCallResults.push({
          role: "tool",
          tool_call_id: tc.id,
          content: result,
        });
      }

      // Second call: stream the final response with tool results
      const finalMessages = [
        ...aiMessages,
        choice.message,
        ...toolCallResults,
      ];

      const finalResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: finalMessages,
          stream: true,
        }),
      });

      if (!finalResponse.ok) {
        // Return tool results directly
        const summary = toolCallResults.map(r => r.content).join("\n");
        const sseData = `data: ${JSON.stringify({ choices: [{ delta: { content: summary } }] })}\n\ndata: [DONE]\n\n`;
        return new Response(sseData, {
          headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
        });
      }

      return new Response(finalResponse.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // Regular user: just stream
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: aiMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Muitas solicitações. Tente novamente em instantes." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "Créditos insuficientes." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro no serviço de IA" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("budget-assistant error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
