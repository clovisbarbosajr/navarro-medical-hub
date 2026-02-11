
-- Audit log table
CREATE TABLE public.audit_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  user_email text,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_title text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can read
CREATE POLICY "Admins read audit_log"
  ON public.audit_log FOR SELECT
  USING (public.is_admin());

-- Content editors can insert (logging their own actions)
CREATE POLICY "Editors insert audit_log"
  ON public.audit_log FOR INSERT
  WITH CHECK (public.is_content_editor());

-- Index for fast queries
CREATE INDEX idx_audit_log_created_at ON public.audit_log (created_at DESC);
