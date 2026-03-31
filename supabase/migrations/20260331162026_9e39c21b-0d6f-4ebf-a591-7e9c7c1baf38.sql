CREATE TABLE public.network_item_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES public.network_items(id) ON DELETE CASCADE,
  note_text text NOT NULL,
  created_by text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.network_item_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access item_notes" ON public.network_item_notes
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE INDEX idx_network_item_notes_item_id ON public.network_item_notes(item_id);