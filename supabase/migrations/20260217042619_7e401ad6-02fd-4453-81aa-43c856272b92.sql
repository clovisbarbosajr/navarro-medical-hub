
-- Create RH Payments table
CREATE TABLE public.rh_payments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_name text NOT NULL,
  unit text NOT NULL DEFAULT 'DEERFIELD',
  month_label text NOT NULL,
  week_number integer,
  week_ref text,
  check_number text,
  delivery_date text,
  status text DEFAULT '',
  obs text DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.rh_payments ENABLE ROW LEVEL SECURITY;

-- Same access as denise_procedures: admin + ligia
CREATE POLICY "RH payments access read"
  ON public.rh_payments FOR SELECT
  USING (can_access_procedures());

CREATE POLICY "RH payments access insert"
  ON public.rh_payments FOR INSERT
  WITH CHECK (can_access_procedures());

CREATE POLICY "RH payments access update"
  ON public.rh_payments FOR UPDATE
  USING (can_access_procedures());

CREATE POLICY "RH payments access delete"
  ON public.rh_payments FOR DELETE
  USING (can_access_procedures());

-- Trigger for updated_at
CREATE TRIGGER update_rh_payments_updated_at
  BEFORE UPDATE ON public.rh_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
