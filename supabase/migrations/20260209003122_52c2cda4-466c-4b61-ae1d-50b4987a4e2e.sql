
-- ============================================
-- NAVARRO MEDICAL INTRANET — FULL SCHEMA
-- ============================================

-- 1. Role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'manager');

-- 2. User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Security definer helper functions (avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

CREATE OR REPLACE FUNCTION public.is_manager()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'manager')
$$;

CREATE OR REPLACE FUNCTION public.is_content_editor()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_admin() OR public.is_manager()
$$;

-- 4. Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ============================================
-- CONTENT TABLES
-- ============================================

-- 5. Birthdays
CREATE TABLE public.birthdays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  photo_url TEXT,
  birth_date DATE NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.birthdays ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_birthdays_updated_at BEFORE UPDATE ON public.birthdays
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Announcements
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  end_date DATE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. News
CREATE TABLE public.news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  excerpt TEXT,
  image_url TEXT,
  category TEXT NOT NULL DEFAULT 'Geral',
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON public.news
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Gallery Images (Campanhas)
CREATE TABLE public.gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_gallery_images_updated_at BEFORE UPDATE ON public.gallery_images
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 9. Menu Links (Admin only)
CREATE TABLE public.menu_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('sistemas', 'ferramentas', 'helpdesk')),
  label TEXT NOT NULL,
  href TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.menu_links ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_menu_links_updated_at BEFORE UPDATE ON public.menu_links
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 10. Site Settings (Admin only)
CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 11. Holiday Themes
CREATE TABLE public.holiday_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '🎉',
  description TEXT,
  css_overrides JSONB NOT NULL DEFAULT '{}',
  holiday_date DATE NOT NULL,
  activation_start DATE NOT NULL,
  activation_end DATE NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.holiday_themes ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_holiday_themes_updated_at BEFORE UPDATE ON public.holiday_themes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- RLS POLICIES
-- ============================================

-- user_roles: only admin can manage
CREATE POLICY "Admin manages roles" ON public.user_roles FOR ALL USING (public.is_admin());
CREATE POLICY "Users can read own role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- birthdays: public read, content editors write
CREATE POLICY "Public read birthdays" ON public.birthdays FOR SELECT USING (true);
CREATE POLICY "Editors manage birthdays" ON public.birthdays FOR INSERT WITH CHECK (public.is_content_editor());
CREATE POLICY "Editors update birthdays" ON public.birthdays FOR UPDATE USING (public.is_content_editor());
CREATE POLICY "Editors delete birthdays" ON public.birthdays FOR DELETE USING (public.is_content_editor());

-- announcements: public read, content editors write
CREATE POLICY "Public read announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Editors manage announcements" ON public.announcements FOR INSERT WITH CHECK (public.is_content_editor());
CREATE POLICY "Editors update announcements" ON public.announcements FOR UPDATE USING (public.is_content_editor());
CREATE POLICY "Editors delete announcements" ON public.announcements FOR DELETE USING (public.is_content_editor());

-- news: public read, content editors write
CREATE POLICY "Public read news" ON public.news FOR SELECT USING (true);
CREATE POLICY "Editors manage news" ON public.news FOR INSERT WITH CHECK (public.is_content_editor());
CREATE POLICY "Editors update news" ON public.news FOR UPDATE USING (public.is_content_editor());
CREATE POLICY "Editors delete news" ON public.news FOR DELETE USING (public.is_content_editor());

-- gallery_images: public read, content editors write
CREATE POLICY "Public read gallery" ON public.gallery_images FOR SELECT USING (true);
CREATE POLICY "Editors manage gallery" ON public.gallery_images FOR INSERT WITH CHECK (public.is_content_editor());
CREATE POLICY "Editors update gallery" ON public.gallery_images FOR UPDATE USING (public.is_content_editor());
CREATE POLICY "Editors delete gallery" ON public.gallery_images FOR DELETE USING (public.is_content_editor());

-- menu_links: public read, admin only write
CREATE POLICY "Public read menu_links" ON public.menu_links FOR SELECT USING (true);
CREATE POLICY "Admin manage menu_links" ON public.menu_links FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admin update menu_links" ON public.menu_links FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admin delete menu_links" ON public.menu_links FOR DELETE USING (public.is_admin());

-- site_settings: public read, admin only write
CREATE POLICY "Public read site_settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admin manage site_settings" ON public.site_settings FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admin update site_settings" ON public.site_settings FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admin delete site_settings" ON public.site_settings FOR DELETE USING (public.is_admin());

-- holiday_themes: public read, content editors write
CREATE POLICY "Public read themes" ON public.holiday_themes FOR SELECT USING (true);
CREATE POLICY "Editors manage themes" ON public.holiday_themes FOR INSERT WITH CHECK (public.is_content_editor());
CREATE POLICY "Editors update themes" ON public.holiday_themes FOR UPDATE USING (public.is_content_editor());
CREATE POLICY "Editors delete themes" ON public.holiday_themes FOR DELETE USING (public.is_content_editor());

-- ============================================
-- STORAGE BUCKET
-- ============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true);

-- Storage policies: public read, editors write
CREATE POLICY "Public read media" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "Editors upload media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'media' AND public.is_content_editor());
CREATE POLICY "Editors update media" ON storage.objects FOR UPDATE USING (bucket_id = 'media' AND public.is_content_editor());
CREATE POLICY "Editors delete media" ON storage.objects FOR DELETE USING (bucket_id = 'media' AND public.is_content_editor());
