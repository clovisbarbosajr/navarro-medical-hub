
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS password_changed boolean NOT NULL DEFAULT false;
