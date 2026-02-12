
-- Auto-create notification when announcement is created
CREATE OR REPLACE FUNCTION public.create_notification_on_announcement()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (title, body, type, reference_id)
  VALUES (NEW.title, NEW.body, 'announcement', NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_announcement_notification
AFTER INSERT ON public.announcements
FOR EACH ROW
EXECUTE FUNCTION public.create_notification_on_announcement();

-- Auto-create notification when news is created
CREATE OR REPLACE FUNCTION public.create_notification_on_news()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (title, body, type, reference_id)
  VALUES (NEW.title, NEW.excerpt, 'news', NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_news_notification
AFTER INSERT ON public.news
FOR EACH ROW
EXECUTE FUNCTION public.create_notification_on_news();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
