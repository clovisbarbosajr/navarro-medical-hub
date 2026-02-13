
-- Table for Denise's procedure tracking spreadsheet (admin-only)
CREATE TABLE public.denise_procedures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month_label text NOT NULL, -- e.g. 'DEZ2025', 'JAN2026', 'FEV2026'
  procedure_date date,
  patient_name text,
  chart_number text,
  procedure_name text,
  proc_price numeric DEFAULT 0,
  cost numeric DEFAULT 0,
  denise_paid boolean DEFAULT false,
  percentage numeric DEFAULT 0.6,
  square_confirmed text DEFAULT 'escolher', -- 'sim', 'nao', 'escolher'
  is_summary_row boolean DEFAULT false, -- for "Total pago" rows
  summary_label text, -- label for summary rows
  summary_value numeric, -- computed total for summary rows
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.denise_procedures ENABLE ROW LEVEL SECURITY;

-- Only admin can read
CREATE POLICY "Admin read denise_procedures"
  ON public.denise_procedures FOR SELECT
  USING (public.is_admin());

-- Only admin can insert
CREATE POLICY "Admin insert denise_procedures"
  ON public.denise_procedures FOR INSERT
  WITH CHECK (public.is_admin());

-- Only admin can update
CREATE POLICY "Admin update denise_procedures"
  ON public.denise_procedures FOR UPDATE
  USING (public.is_admin());

-- Only admin can delete
CREATE POLICY "Admin delete denise_procedures"
  ON public.denise_procedures FOR DELETE
  USING (public.is_admin());

-- Auto-update timestamps
CREATE TRIGGER update_denise_procedures_updated_at
  BEFORE UPDATE ON public.denise_procedures
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
