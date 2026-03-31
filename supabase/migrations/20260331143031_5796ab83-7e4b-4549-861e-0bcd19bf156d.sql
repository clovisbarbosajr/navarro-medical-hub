
CREATE TABLE public.network_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.network_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id uuid NOT NULL REFERENCES public.network_locations(id) ON DELETE CASCADE,
  name text NOT NULL,
  icon text NOT NULL DEFAULT 'server',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.network_category_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.network_categories(id) ON DELETE CASCADE,
  field_name text NOT NULL,
  field_type text NOT NULL DEFAULT 'text',
  is_required boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE public.network_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.network_categories(id) ON DELETE CASCADE,
  field_values jsonb NOT NULL DEFAULT '{}'::jsonb,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER update_network_items_updated_at
  BEFORE UPDATE ON public.network_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.network_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.network_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.network_category_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.network_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access locations" ON public.network_locations FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin full access categories" ON public.network_categories FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin full access fields" ON public.network_category_fields FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin full access items" ON public.network_items FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

INSERT INTO storage.buckets (id, name, public) VALUES ('network-backups', 'network-backups', false);
CREATE POLICY "Admin upload network backups" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'network-backups' AND (SELECT is_admin()));
CREATE POLICY "Admin read network backups" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'network-backups' AND (SELECT is_admin()));
CREATE POLICY "Admin delete network backups" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'network-backups' AND (SELECT is_admin()));

INSERT INTO public.network_locations (name, sort_order) VALUES
  ('Deerfield', 1), ('Orlando', 2), ('Fort Myers', 3), ('Tampa', 4), ('Port St Lucie', 5);

DO $$
DECLARE
  loc record;
  cat_id uuid;
BEGIN
  FOR loc IN SELECT id FROM public.network_locations ORDER BY sort_order LOOP
    INSERT INTO public.network_categories (location_id, name, icon, sort_order) VALUES (loc.id, 'Impressoras', 'printer', 1) RETURNING id INTO cat_id;
    INSERT INTO public.network_category_fields (category_id, field_name, field_type, sort_order) VALUES (cat_id, 'Modelo', 'text', 1), (cat_id, 'IP', 'text', 2), (cat_id, 'Localização', 'text', 3);

    INSERT INTO public.network_categories (location_id, name, icon, sort_order) VALUES (loc.id, 'Computadores', 'monitor', 2) RETURNING id INTO cat_id;
    INSERT INTO public.network_category_fields (category_id, field_name, field_type, sort_order) VALUES (cat_id, 'Modelo', 'text', 1), (cat_id, 'IP', 'text', 2), (cat_id, 'Localização', 'text', 3);

    INSERT INTO public.network_categories (location_id, name, icon, sort_order) VALUES (loc.id, 'Telefones', 'phone', 3) RETURNING id INTO cat_id;
    INSERT INTO public.network_category_fields (category_id, field_name, field_type, sort_order) VALUES (cat_id, 'IP', 'text', 1), (cat_id, 'Localização', 'text', 2);

    INSERT INTO public.network_categories (location_id, name, icon, sort_order) VALUES (loc.id, 'Access Point', 'wifi', 4) RETURNING id INTO cat_id;
    INSERT INTO public.network_category_fields (category_id, field_name, field_type, sort_order) VALUES (cat_id, 'Modelo', 'text', 1), (cat_id, 'IP', 'text', 2), (cat_id, 'Localização', 'text', 3);

    INSERT INTO public.network_categories (location_id, name, icon, sort_order) VALUES (loc.id, 'WAN', 'globe', 5) RETURNING id INTO cat_id;
    INSERT INTO public.network_category_fields (category_id, field_name, field_type, sort_order) VALUES (cat_id, 'Operadora', 'text', 1), (cat_id, 'IP Externo', 'text', 2), (cat_id, 'IP Interno', 'text', 3), (cat_id, 'Login', 'text', 4), (cat_id, 'Senha', 'password', 5);

    INSERT INTO public.network_categories (location_id, name, icon, sort_order) VALUES (loc.id, 'Switch / USG', 'cable', 6) RETURNING id INTO cat_id;
    INSERT INTO public.network_category_fields (category_id, field_name, field_type, sort_order) VALUES (cat_id, 'Modelo', 'text', 1), (cat_id, 'IP', 'text', 2), (cat_id, 'Login', 'text', 3), (cat_id, 'Senha', 'password', 4);

    INSERT INTO public.network_categories (location_id, name, icon, sort_order) VALUES (loc.id, 'Faixa de IP', 'hash', 7) RETURNING id INTO cat_id;
    INSERT INTO public.network_category_fields (category_id, field_name, field_type, sort_order) VALUES (cat_id, 'Faixa', 'text', 1), (cat_id, 'Descrição', 'text', 2);

    INSERT INTO public.network_categories (location_id, name, icon, sort_order) VALUES (loc.id, 'Cloud Key', 'cloud', 8) RETURNING id INTO cat_id;
    INSERT INTO public.network_category_fields (category_id, field_name, field_type, sort_order) VALUES (cat_id, 'IP', 'text', 1), (cat_id, 'Backup', 'file', 2);

    INSERT INTO public.network_categories (location_id, name, icon, sort_order) VALUES (loc.id, 'NVR', 'camera', 9) RETURNING id INTO cat_id;
    INSERT INTO public.network_category_fields (category_id, field_name, field_type, sort_order) VALUES (cat_id, 'IP', 'text', 1), (cat_id, 'Login', 'text', 2), (cat_id, 'Senha', 'password', 3), (cat_id, 'Email', 'text', 4);
  END LOOP;
END $$;
