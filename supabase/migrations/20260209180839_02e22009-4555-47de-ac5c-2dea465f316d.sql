
-- Knowledge base table for storing arbitrary information (insurances, policies, etc.)
CREATE TABLE public.knowledge_base (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

-- Public can read
CREATE POLICY "Public read knowledge_base"
ON public.knowledge_base FOR SELECT
USING (true);

-- Editors can manage
CREATE POLICY "Editors manage knowledge_base"
ON public.knowledge_base FOR INSERT
WITH CHECK (is_content_editor());

CREATE POLICY "Editors update knowledge_base"
ON public.knowledge_base FOR UPDATE
USING (is_content_editor());

CREATE POLICY "Editors delete knowledge_base"
ON public.knowledge_base FOR DELETE
USING (is_content_editor());

-- Timestamp trigger
CREATE TRIGGER update_knowledge_base_updated_at
BEFORE UPDATE ON public.knowledge_base
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
