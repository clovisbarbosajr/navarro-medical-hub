import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get visitor IP from request headers
    const forwarded = req.headers.get("x-forwarded-for");
    const visitorIp = forwarded ? forwarded.split(",")[0].trim() : "unknown";

    // Fetch settings from DB
    const [maintRes, ipsRes] = await Promise.all([
      supabase.from("site_settings").select("value").eq("key", "maintenance_mode").single(),
      supabase.from("site_settings").select("value").eq("key", "allowed_ips").single(),
    ]);

    const maintenanceOn = maintRes.data?.value === "true";
    const allowedIps = (ipsRes.data?.value || "")
      .split(",")
      .map((ip: string) => ip.trim())
      .filter(Boolean);

    let blocked = false;

    if (maintenanceOn && allowedIps.length === 0) {
      blocked = true;
    } else if (allowedIps.length > 0) {
      blocked = !allowedIps.includes(visitorIp);
    }

    return new Response(
      JSON.stringify({ blocked, ip: visitorIp }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ blocked: false, error: "check failed" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  }
});
