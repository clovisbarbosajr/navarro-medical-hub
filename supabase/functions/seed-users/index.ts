import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const results: string[] = [];

    // --- Create Admin user (legacy, disabled) ---
    const { data: adminData, error: adminError } = await supabaseAdmin.auth.admin.createUser({
      email: "admin@navarro.med",
      password: "t8c7Ug1l@",
      email_confirm: true,
    });

    if (adminError) {
      if (adminError.message.includes("already been registered")) {
        results.push("Admin user already exists");
      } else {
        throw new Error(`Admin creation failed: ${adminError.message}`);
      }
    } else {
      results.push("Admin user created");
    }

    // --- Create Inwise user ---
    const { data: inwiseData, error: inwiseError } = await supabaseAdmin.auth.admin.createUser({
      email: "inwise@navarro.med",
      password: "t8c7Ug1l@231284",
      email_confirm: true,
    });

    if (inwiseError) {
      if (inwiseError.message.includes("already been registered")) {
        results.push("Inwise user already exists");
      } else {
        results.push(`Inwise creation note: ${inwiseError.message}`);
      }
    } else {
      results.push("Inwise user created");
    }

    // --- Create Geovana (Manager) user ---
    const { data: managerData, error: managerError } = await supabaseAdmin.auth.admin.createUser({
      email: "manager@navarro.med",
      password: "medic@l",
      email_confirm: true,
    });

    if (managerError) {
      if (managerError.message.includes("already been registered")) {
        results.push("Manager (Geovana) user already exists");
      } else {
        throw new Error(`Manager creation failed: ${managerError.message}`);
      }
    } else {
      results.push("Manager (Geovana) user created");
    }

    // --- Create Ligia user ---
    const { data: ligiaData, error: ligiaError } = await supabaseAdmin.auth.admin.createUser({
      email: "ligia@navarro.med",
      password: "272426",
      email_confirm: true,
    });

    if (ligiaError) {
      if (ligiaError.message.includes("already been registered")) {
        results.push("Ligia user already exists");
      } else {
        results.push(`Ligia creation note: ${ligiaError.message}`);
      }
    } else {
      results.push("Ligia user created");
    }

    // --- Get user IDs (fetch if already existed) ---
    const { data: usersListData } = await supabaseAdmin.auth.admin.listUsers();
    const allUsers = usersListData?.users || [];

    const adminId = allUsers.find((u: any) => u.email === "admin@navarro.med")?.id;
    const inwiseId = allUsers.find((u: any) => u.email === "inwise@navarro.med")?.id;
    const managerId = allUsers.find((u: any) => u.email === "manager@navarro.med")?.id;
    const ligiaId = allUsers.find((u: any) => u.email === "ligia@navarro.med")?.id;

    // --- Assign roles ---
    if (adminId) {
      const { error } = await supabaseAdmin.from("user_roles").upsert(
        { user_id: adminId, role: "admin" },
        { onConflict: "user_id,role" }
      );
      if (error) results.push(`Admin role error: ${error.message}`);
      else results.push("Admin role assigned");
    }

    if (inwiseId) {
      const { error } = await supabaseAdmin.from("user_roles").upsert(
        { user_id: inwiseId, role: "admin" },
        { onConflict: "user_id,role" }
      );
      if (error) results.push(`Inwise role error: ${error.message}`);
      else results.push("Inwise role assigned (admin)");
    }

    if (managerId) {
      const { error } = await supabaseAdmin.from("user_roles").upsert(
        { user_id: managerId, role: "manager" },
        { onConflict: "user_id,role" }
      );
      if (error) results.push(`Manager role error: ${error.message}`);
      else results.push("Manager (Geovana) role assigned");
    }

    if (ligiaId) {
      const { error } = await supabaseAdmin.from("user_roles").upsert(
        { user_id: ligiaId, role: "manager" },
        { onConflict: "user_id,role" }
      );
      if (error) results.push(`Ligia role error: ${error.message}`);
      else results.push("Ligia role assigned (manager)");
    }

    // --- Seed Holiday Themes for 2026 ---
    const holidayThemes = [
      {
        name: "Valentine's Day",
        emoji: "💕",
        description: "Dia dos Namorados — amor está no ar!",
        css_overrides: {
          "--primary": "340 82% 52%",
          "--accent": "330 80% 65%",
          "--glow-primary": "340 82% 52%",
          "--glow-accent": "330 80% 65%",
        },
        holiday_date: "2026-02-14",
        activation_start: "2026-02-07",
        activation_end: "2026-02-15",
        enabled: false,
        created_by: adminId,
      },
      {
        name: "St. Patrick's Day",
        emoji: "🍀",
        description: "Dia de São Patrício — sorte para todos!",
        css_overrides: {
          "--primary": "140 70% 40%",
          "--accent": "120 60% 50%",
          "--glow-primary": "140 70% 40%",
          "--glow-accent": "120 60% 50%",
        },
        holiday_date: "2026-03-17",
        activation_start: "2026-03-10",
        activation_end: "2026-03-18",
        enabled: false,
        created_by: adminId,
      },
      {
        name: "Easter",
        emoji: "🐣",
        description: "Páscoa — renovação e esperança!",
        css_overrides: {
          "--primary": "270 60% 60%",
          "--accent": "50 80% 65%",
          "--glow-primary": "270 60% 60%",
          "--glow-accent": "50 80% 65%",
        },
        holiday_date: "2026-04-05",
        activation_start: "2026-03-29",
        activation_end: "2026-04-06",
        enabled: false,
        created_by: adminId,
      },
      {
        name: "Mother's Day",
        emoji: "🌸",
        description: "Dia das Mães — homenagem especial!",
        css_overrides: {
          "--primary": "320 70% 55%",
          "--accent": "300 60% 70%",
          "--glow-primary": "320 70% 55%",
          "--glow-accent": "300 60% 70%",
        },
        holiday_date: "2026-05-10",
        activation_start: "2026-05-03",
        activation_end: "2026-05-11",
        enabled: false,
        created_by: adminId,
      },
      {
        name: "Memorial Day",
        emoji: "🇺🇸",
        description: "Memorial Day — honrando os heróis!",
        css_overrides: {
          "--primary": "220 80% 45%",
          "--accent": "0 70% 50%",
          "--glow-primary": "220 80% 45%",
          "--glow-accent": "0 70% 50%",
        },
        holiday_date: "2026-05-25",
        activation_start: "2026-05-18",
        activation_end: "2026-05-26",
        enabled: false,
        created_by: adminId,
      },
      {
        name: "Father's Day",
        emoji: "👔",
        description: "Dia dos Pais — celebrando os pais!",
        css_overrides: {
          "--primary": "210 70% 45%",
          "--accent": "40 70% 55%",
          "--glow-primary": "210 70% 45%",
          "--glow-accent": "40 70% 55%",
        },
        holiday_date: "2026-06-21",
        activation_start: "2026-06-14",
        activation_end: "2026-06-22",
        enabled: false,
        created_by: adminId,
      },
      {
        name: "Independence Day",
        emoji: "🎆",
        description: "4th of July — celebração nacional!",
        css_overrides: {
          "--primary": "0 72% 51%",
          "--accent": "220 80% 50%",
          "--glow-primary": "0 72% 51%",
          "--glow-accent": "220 80% 50%",
        },
        holiday_date: "2026-07-04",
        activation_start: "2026-06-27",
        activation_end: "2026-07-05",
        enabled: false,
        created_by: adminId,
      },
      {
        name: "Labor Day",
        emoji: "⚒️",
        description: "Dia do Trabalho — valorizando o trabalhador!",
        css_overrides: {
          "--primary": "210 60% 50%",
          "--accent": "30 60% 55%",
          "--glow-primary": "210 60% 50%",
          "--glow-accent": "30 60% 55%",
        },
        holiday_date: "2026-09-07",
        activation_start: "2026-08-31",
        activation_end: "2026-09-08",
        enabled: false,
        created_by: adminId,
      },
      {
        name: "Halloween",
        emoji: "🎃",
        description: "Halloween — trick or treat!",
        css_overrides: {
          "--primary": "25 95% 53%",
          "--accent": "270 60% 40%",
          "--glow-primary": "25 95% 53%",
          "--glow-accent": "270 60% 40%",
          "--background": "270 30% 6%",
        },
        holiday_date: "2026-10-31",
        activation_start: "2026-10-24",
        activation_end: "2026-11-01",
        enabled: false,
        created_by: adminId,
      },
      {
        name: "Thanksgiving",
        emoji: "🦃",
        description: "Ação de Graças — gratidão e família!",
        css_overrides: {
          "--primary": "30 70% 45%",
          "--accent": "45 80% 55%",
          "--glow-primary": "30 70% 45%",
          "--glow-accent": "45 80% 55%",
        },
        holiday_date: "2026-11-26",
        activation_start: "2026-11-19",
        activation_end: "2026-11-27",
        enabled: false,
        created_by: adminId,
      },
      {
        name: "Christmas",
        emoji: "🎄",
        description: "Natal — paz e alegria para todos!",
        css_overrides: {
          "--primary": "0 72% 47%",
          "--accent": "140 60% 40%",
          "--glow-primary": "0 72% 47%",
          "--glow-accent": "140 60% 40%",
        },
        holiday_date: "2026-12-25",
        activation_start: "2026-12-18",
        activation_end: "2026-12-26",
        enabled: false,
        created_by: adminId,
      },
      {
        name: "New Year's Eve",
        emoji: "🎊",
        description: "Réveillon — feliz ano novo!",
        css_overrides: {
          "--primary": "45 100% 50%",
          "--accent": "210 80% 60%",
          "--glow-primary": "45 100% 50%",
          "--glow-accent": "210 80% 60%",
        },
        holiday_date: "2026-12-31",
        activation_start: "2026-12-24",
        activation_end: "2027-01-02",
        enabled: false,
        created_by: adminId,
      },
    ];

    const { data: existingThemes } = await supabaseAdmin.from("holiday_themes").select("id").limit(1);
    if (!existingThemes || existingThemes.length === 0) {
      const { error: themesError } = await supabaseAdmin.from("holiday_themes").insert(holidayThemes);
      if (themesError) results.push(`Themes seed error: ${themesError.message}`);
      else results.push(`${holidayThemes.length} holiday themes seeded`);
    } else {
      results.push("Holiday themes already exist, skipping");
    }

    const { data: existingLinks } = await supabaseAdmin.from("menu_links").select("id").limit(1);
    if (!existingLinks || existingLinks.length === 0) {
      const menuLinks = [
        { category: "sistemas", label: "Prontuário Eletrônico", href: "http://localhost:8085/systems/prontuario", sort_order: 1, created_by: adminId },
        { category: "sistemas", label: "Agendamento", href: "http://localhost:8085/systems/agendamento", sort_order: 2, created_by: adminId },
        { category: "sistemas", label: "Laboratório", href: "http://localhost:8085/systems/lab", sort_order: 3, created_by: adminId },
        { category: "sistemas", label: "Farmácia", href: "http://localhost:8085/systems/farmacia", sort_order: 4, created_by: adminId },
        { category: "ferramentas", label: "Calculadoras Médicas", href: "http://localhost:8085/tools/calculadoras", sort_order: 1, created_by: adminId },
        { category: "ferramentas", label: "Protocolos", href: "http://localhost:8085/tools/protocolos", sort_order: 2, created_by: adminId },
        { category: "ferramentas", label: "Documentos", href: "http://localhost:8085/tools/documentos", sort_order: 3, created_by: adminId },
        { category: "helpdesk", label: "Abrir Chamado", href: "http://localhost:8085/helpdesk/new", sort_order: 1, created_by: adminId },
        { category: "helpdesk", label: "Meus Chamados", href: "http://localhost:8085/helpdesk/my", sort_order: 2, created_by: adminId },
        { category: "helpdesk", label: "FAQ", href: "http://localhost:8085/helpdesk/faq", sort_order: 3, created_by: adminId },
      ];
      const { error: linksError } = await supabaseAdmin.from("menu_links").insert(menuLinks);
      if (linksError) results.push(`Menu links error: ${linksError.message}`);
      else results.push("Menu links seeded");
    } else {
      results.push("Menu links already exist, skipping");
    }

    const { data: existingNews } = await supabaseAdmin.from("news").select("id").limit(1);
    if (!existingNews || existingNews.length === 0) {
      const newsItems = [
        { title: "Novo protocolo de higienização das mãos", excerpt: "Conheça as novas diretrizes.", image_url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=300&fit=crop", category: "Saúde", created_by: adminId },
        { title: "Resultados da pesquisa de clima organizacional", excerpt: "Confira os resultados.", image_url: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=300&fit=crop", category: "RH", created_by: adminId },
      ];
      const { error: newsError } = await supabaseAdmin.from("news").insert(newsItems);
      if (newsError) results.push(`News error: ${newsError.message}`);
      else results.push("News seeded");
    }

    const { data: existingGallery } = await supabaseAdmin.from("gallery_images").select("id").limit(1);
    if (!existingGallery || existingGallery.length === 0) {
      const galleryItems = [
        { title: "🏥 Semana de Segurança", description: "Participe!", image_url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=400&fit=crop", sort_order: 1, created_by: adminId },
      ];
      const { error: galleryError } = await supabaseAdmin.from("gallery_images").insert(galleryItems);
      if (galleryError) results.push(`Gallery error: ${galleryError.message}`);
      else results.push("Gallery images seeded");
    }

    const { data: existingBirthdays } = await supabaseAdmin.from("birthdays").select("id").limit(1);
    if (!existingBirthdays || existingBirthdays.length === 0) {
      const birthdays = [
        { name: "Ana Beatriz Silva", birth_date: "1990-02-03", photo_url: "https://i.pravatar.cc/80?img=1", created_by: adminId },
      ];
      const { error: bdError } = await supabaseAdmin.from("birthdays").insert(birthdays);
      if (bdError) results.push(`Birthdays error: ${bdError.message}`);
      else results.push("Birthdays seeded");
    }

    const { data: existingAnnouncements } = await supabaseAdmin.from("announcements").select("id").limit(1);
    if (!existingAnnouncements || existingAnnouncements.length === 0) {
      const { error: annError } = await supabaseAdmin.from("announcements").insert({
        title: "⚠️ Manutenção Programada",
        body: "Manutenção preventiva.",
        enabled: true,
        end_date: "2026-02-16",
        created_by: adminId,
      });
      if (annError) results.push(`Announcement error: ${annError.message}`);
      else results.push("Announcement seeded");
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
