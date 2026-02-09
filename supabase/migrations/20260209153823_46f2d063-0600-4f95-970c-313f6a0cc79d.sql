ALTER TABLE public.menu_links ADD COLUMN open_mode text NOT NULL DEFAULT 'new_tab';
COMMENT ON COLUMN public.menu_links.open_mode IS 'new_tab or iframe';