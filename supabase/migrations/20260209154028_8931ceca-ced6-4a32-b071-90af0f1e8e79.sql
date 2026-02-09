-- Update menu_links policies to allow content editors (admin OR manager) instead of admin-only

DROP POLICY "Admin delete menu_links" ON public.menu_links;
DROP POLICY "Admin manage menu_links" ON public.menu_links;
DROP POLICY "Admin update menu_links" ON public.menu_links;

CREATE POLICY "Editors delete menu_links" ON public.menu_links FOR DELETE USING (is_content_editor());
CREATE POLICY "Editors manage menu_links" ON public.menu_links FOR INSERT WITH CHECK (is_content_editor());
CREATE POLICY "Editors update menu_links" ON public.menu_links FOR UPDATE USING (is_content_editor());

-- Also update site_settings to allow managers
DROP POLICY "Admin delete site_settings" ON public.site_settings;
DROP POLICY "Admin manage site_settings" ON public.site_settings;
DROP POLICY "Admin update site_settings" ON public.site_settings;

CREATE POLICY "Editors delete site_settings" ON public.site_settings FOR DELETE USING (is_content_editor());
CREATE POLICY "Editors manage site_settings" ON public.site_settings FOR INSERT WITH CHECK (is_content_editor());
CREATE POLICY "Editors update site_settings" ON public.site_settings FOR UPDATE USING (is_content_editor());