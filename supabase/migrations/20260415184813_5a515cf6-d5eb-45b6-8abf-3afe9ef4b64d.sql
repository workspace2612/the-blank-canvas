
-- Fix function search path
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix overly permissive candidates policies
DROP POLICY IF EXISTS "Users can upsert own candidate record" ON public.candidates;
DROP POLICY IF EXISTS "Users can update candidate record" ON public.candidates;

CREATE POLICY "Authenticated can insert candidate record" ON public.candidates FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can update candidate record" ON public.candidates FOR UPDATE USING (auth.role() = 'authenticated');
