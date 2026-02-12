
-- Create access_logs table for tracking visits
CREATE TABLE public.access_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT,
  user_agent TEXT,
  path TEXT DEFAULT '/',
  country TEXT,
  city TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can read access logs
CREATE POLICY "Admins read access_logs"
ON public.access_logs
FOR SELECT
USING (is_admin());

-- Anyone can insert (anonymous visitors)
CREATE POLICY "Anyone can insert access_logs"
ON public.access_logs
FOR INSERT
WITH CHECK (true);

-- Index for performance
CREATE INDEX idx_access_logs_created_at ON public.access_logs (created_at DESC);
CREATE INDEX idx_access_logs_ip ON public.access_logs (ip_address);
