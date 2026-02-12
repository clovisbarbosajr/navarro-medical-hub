
-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT,
  type TEXT NOT NULL DEFAULT 'announcement',
  reference_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read notifications"
ON public.notifications FOR SELECT USING (true);

CREATE POLICY "Editors manage notifications"
ON public.notifications FOR INSERT WITH CHECK (is_content_editor());

CREATE POLICY "Editors delete notifications"
ON public.notifications FOR DELETE USING (is_content_editor());

CREATE INDEX idx_notifications_created_at ON public.notifications (created_at DESC);

-- Create push_subscriptions table for Web Push
CREATE TABLE public.push_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe push"
ON public.push_subscriptions FOR INSERT WITH CHECK (true);

CREATE POLICY "Editors read push subs"
ON public.push_subscriptions FOR SELECT USING (is_content_editor());
