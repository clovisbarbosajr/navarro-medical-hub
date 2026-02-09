import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Fetch all procedures from the database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: procedures } = await supabase
      .from("procedures")
      .select("code, name, price, category, package_name")
      .order("name");

    const proceduresList = (procedures || [])
      .map((p: any) => `${p.code} | ${p.name} | $${p.price}${p.package_name ? ` | Pacote: ${p.package_name}` : ""} | Cat: ${p.category}`)
      .join("\n");

    const systemPrompt = `Você é o Clovis (menino do computador), assistente virtual de orçamentos da Navarro Medical.

REGRAS IMPORTANTES:
1. Responda SEMPRE em português do Brasil
2. Seja objetiva e profissional
3. Quando o usuário colar uma lista de procedimentos (geralmente com códigos numéricos e nomes), identifique cada um na base de dados e calcule o orçamento
4. Apresente cada item encontrado em uma tabela formatada com: Código | Nome | Valor
5. Ao final, mostre o TOTAL
6. Se um procedimento não for encontrado na base, avise o usuário
7. Pacientes do PLANO NAVARRO têm 15% de desconto no valor final dos exames laboratoriais e 30% de desconto nas consultas com Dr Denise e Ana Pinon
8. Quando perguntarem sobre consultas com médicos específicos, busque na base
9. Consulta geral: $200 (com 1 retorno em 30 dias)
10. Dr Denise (Wellness, HRT, Dermatologia): $400 (com retorno em 30 dias)
11. Dr Ana Pinon (Psiquiatria): $250 primeira consulta, $150 acompanhamento
12. NÃO invente valores. Se não encontrar, diga que o procedimento não está na base
13. Quando o usuário colar texto com procedimentos, podem vir em formatos variados (com ou sem código). Faça o matching pelo nome ou código
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

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Muitas solicitações. Tente novamente em instantes." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro no serviço de IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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
