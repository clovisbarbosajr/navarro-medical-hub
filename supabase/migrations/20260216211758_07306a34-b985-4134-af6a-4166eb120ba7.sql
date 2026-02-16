-- Drop existing restrictive policies on denise_procedures
DROP POLICY IF EXISTS "Admin read denise_procedures" ON public.denise_procedures;
DROP POLICY IF EXISTS "Admin insert denise_procedures" ON public.denise_procedures;
DROP POLICY IF EXISTS "Admin update denise_procedures" ON public.denise_procedures;
DROP POLICY IF EXISTS "Admin delete denise_procedures" ON public.denise_procedures;

-- Create a helper function to check if user is allowed to access procedures
-- (admin OR specific email ligia@navarro.med)
CREATE OR REPLACE FUNCTION public.can_access_procedures()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    public.is_admin() 
    OR (
      auth.uid() IS NOT NULL 
      AND EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() 
        AND email = 'ligia@navarro.med'
      )
    )
$$;

-- Recreate policies using the new function
CREATE POLICY "Procedures access read" ON public.denise_procedures
FOR SELECT USING (can_access_procedures());

CREATE POLICY "Procedures access insert" ON public.denise_procedures
FOR INSERT WITH CHECK (can_access_procedures());

CREATE POLICY "Procedures access update" ON public.denise_procedures
FOR UPDATE USING (can_access_procedures());

CREATE POLICY "Procedures access delete" ON public.denise_procedures
FOR DELETE USING (can_access_procedures());