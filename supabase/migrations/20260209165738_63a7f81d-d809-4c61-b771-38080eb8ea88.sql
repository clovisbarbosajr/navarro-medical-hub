-- Add background_type column to holiday_themes
-- Allows each theme to specify an animated background
ALTER TABLE public.holiday_themes
ADD COLUMN background_type TEXT DEFAULT NULL;

-- Example values: 'hearts', 'fireworks', 'snowflakes', 'flowers', 'stars', 'balloons', etc.
COMMENT ON COLUMN public.holiday_themes.background_type IS 'Type of animated background: hearts, snowflakes, fireworks, flowers, stars, balloons, confetti';
