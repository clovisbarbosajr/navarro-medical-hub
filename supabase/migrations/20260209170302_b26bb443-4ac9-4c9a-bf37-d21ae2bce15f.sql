-- Add custom background image URL column
ALTER TABLE public.holiday_themes
ADD COLUMN background_image_url TEXT DEFAULT NULL;

COMMENT ON COLUMN public.holiday_themes.background_image_url IS 'Custom background image that overrides the animated background';
