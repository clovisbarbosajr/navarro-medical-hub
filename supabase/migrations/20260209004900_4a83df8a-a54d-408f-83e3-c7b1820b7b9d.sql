-- Add columns for professional date features
ALTER TABLE public.holiday_themes
  ADD COLUMN is_professional_date boolean NOT NULL DEFAULT false,
  ADD COLUMN suggested_message text,
  ADD COLUMN image_bank_url text;