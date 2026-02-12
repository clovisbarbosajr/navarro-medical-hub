
-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  location TEXT,
  color TEXT DEFAULT '#6366f1',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Editors manage events" ON public.events FOR INSERT WITH CHECK (is_content_editor());
CREATE POLICY "Editors update events" ON public.events FOR UPDATE USING (is_content_editor());
CREATE POLICY "Editors delete events" ON public.events FOR DELETE USING (is_content_editor());

CREATE INDEX idx_events_date ON public.events (event_date);

CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
