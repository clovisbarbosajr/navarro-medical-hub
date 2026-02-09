
-- Table to store all procedure/service pricing
CREATE TABLE public.procedures (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL,
  name text NOT NULL,
  price numeric(10,2) NOT NULL,
  category text DEFAULT 'individual',
  package_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.procedures ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Public read procedures" ON public.procedures FOR SELECT USING (true);

-- Editors manage
CREATE POLICY "Editors manage procedures" ON public.procedures FOR INSERT WITH CHECK (is_content_editor());
CREATE POLICY "Editors update procedures" ON public.procedures FOR UPDATE USING (is_content_editor());
CREATE POLICY "Editors delete procedures" ON public.procedures FOR DELETE USING (is_content_editor());

-- Trigger for updated_at
CREATE TRIGGER update_procedures_updated_at BEFORE UPDATE ON public.procedures
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- === SEED DATA ===

-- Consultations & Services (from sheet 1)
INSERT INTO public.procedures (code, name, price, category) VALUES
('CONSULT', 'Consultation + 1 Follow up 30 dias', 200.00, 'consultation'),
('PHYSICAL', 'Physical Exam', 150.00, 'consultation'),
('EKG', 'EKG', 50.00, 'exam'),
('VIT-D', 'Vitamin D', 40.00, 'exam'),
('VIT-B12', 'Vitamin B12', 30.00, 'exam'),
('US-TV', 'Transvaginal Ultrasound', 120.00, 'exam'),
('US-PELVIC', 'Pelvic Ultrasound', 150.00, 'exam'),
('US-ABD', 'Abdominal Ultrasound', 150.00, 'exam'),
('US-SOFT', 'Soft Tissue Ultrasound', 120.00, 'exam'),
('US-BREAST', 'Bilateral Breast Ultrasound', 150.00, 'exam'),
('CONSULT-DENISE', 'Consulta: DENISE (WELLNESS, HRT, DERMATOLOGIA) - com retorno 30 dias', 400.00, 'consultation'),
('CONSULT-ANA-1', 'Consulta: ANA PINON (PSIQUIATRIA) - Primeira consulta', 250.00, 'consultation'),
('CONSULT-ANA-S', 'Consulta: ANA PINON (PSIQUIATRIA) - sem retorno', 250.00, 'consultation'),
('CONSULT-ANA-A', 'Consulta: ANA PINON (PSIQUIATRIA) - acompanhamento', 150.00, 'consultation');

-- Package 001 - Annual Private (W&M)
INSERT INTO public.procedures (code, name, price, category, package_name) VALUES
('1759', 'CBC (H/H, RBC, Indices, WBC, Plt)', 5.55, 'lab', '001 Annual Private (W&M)'),
('10231', 'Comprehensive Metabolic Panel', 12.00, 'lab', '001 Annual Private (W&M)'),
('496', 'Hemoglobin A1c', 9.00, 'lab', '001 Annual Private (W&M)'),
('5616', 'Iron, TIBC and Ferritin Panel', 29.64, 'lab', '001 Annual Private (W&M)'),
('19543', 'Lipid Panel with Ratios', 11.40, 'lab', '001 Annual Private (W&M)'),
('36127', 'TSH with Reflex to Free T4', 10.50, 'lab', '001 Annual Private (W&M)'),
('3020', 'Urinalysis, Complete, with Reflex to Culture', 7.50, 'lab', '001 Annual Private (W&M)'),
('7065', 'Vitamin B12 (Cobalamin) and Folate Panel, Serum', 21.75, 'lab', '001 Annual Private (W&M)'),
('17306', 'Vitamin D, 25-Hydroxy, Total, Immunoassay', 49.50, 'lab', '001 Annual Private (W&M)');

-- Package 002 - Private Hormone Male
INSERT INTO public.procedures (code, name, price, category, package_name) VALUES
('402', 'DHEA Sulfate, Immunoassay', 67.50, 'lab', '002 Private Hormone Male'),
('4021', 'Estradiol', 22.50, 'lab', '002 Private Hormone Male'),
('5363', 'PSA, Total', 18.00, 'lab', '002 Private Hormone Male'),
('7137', 'FSH and LH', 24.00, 'lab', '002 Private Hormone Male'),
('746', 'PROLACTIN', 12.75, 'lab', '002 Private Hormone Male'),
('37073', 'Testosterone, Free (Dialysis), Total (MS) and SHBG', 58.50, 'lab', '002 Private Hormone Male');

-- Package 003 - Private Hormone Female
INSERT INTO public.procedures (code, name, price, category, package_name) VALUES
('402-F', 'DHEA Sulfate, Immunoassay', 67.50, 'lab', '003 Private Hormone Female'),
('4021-F', 'Estradiol', 22.50, 'lab', '003 Private Hormone Female'),
('745', 'Progesterone', 25.50, 'lab', '003 Private Hormone Female'),
('746-F', 'PROLACTIN', 12.75, 'lab', '003 Private Hormone Female'),
('7137-F', 'FSH and LH', 24.00, 'lab', '003 Private Hormone Female'),
('37073-F', 'Testosterone, Free (Dialysis), Total (MS) and SHBG', 58.50, 'lab', '003 Private Hormone Female');

-- Package 004.1 - Private Dermatology
INSERT INTO public.procedures (code, name, price, category, package_name) VALUES
('3542', 'Tissue, Pathology Report', 93.00, 'lab', '004.1 Private Dermatology'),
('4605', 'Culture, Fungus, Skin, Hair, Nail with KOH', 154.62, 'lab', '004.1 Private Dermatology');

-- Package 004.2 - Private Dermatology Roaccutan
INSERT INTO public.procedures (code, name, price, category, package_name) VALUES
('19593', 'CBC (Includes Differential and Platelets) (REFL)', 7.50, 'lab', '004.2 Private Dermatology/Roaccutan'),
('482-R', 'Gamma Glutamyl Transferase (GGT)', 22.50, 'lab', '004.2 Private Dermatology/Roaccutan'),
('8396-R', 'hCG, Total, Quantitative', 24.00, 'lab', '004.2 Private Dermatology/Roaccutan'),
('10256', 'Hepatic Function Panel', 9.21, 'lab', '004.2 Private Dermatology/Roaccutan'),
('10231-R', 'Comprehensive Metabolic Panel', 12.00, 'lab', '004.2 Private Dermatology/Roaccutan'),
('374', 'Creatine Kinase (CK), Total', 28.50, 'lab', '004.2 Private Dermatology/Roaccutan'),
('899', 'TSH', 10.50, 'lab', '004.2 Private Dermatology/Roaccutan'),
('19543-R', 'Lipid Panel with Ratios', 11.40, 'lab', '004.2 Private Dermatology/Roaccutan'),
('17306-R', 'Vitamin D, 25-Hydroxy, Total, Immunoassay', 49.50, 'lab', '004.2 Private Dermatology/Roaccutan');

-- Package 005 - Private Anemia
INSERT INTO public.procedures (code, name, price, category, package_name) VALUES
('793', 'Reticulocyte Count, Automated', 24.00, 'lab', '005 Private Anemia'),
('31789', 'Homocysteine', 46.50, 'lab', '005 Private Anemia'),
('5616-A', 'Iron, TIBC and Ferritin Panel', 29.64, 'lab', '005 Private Anemia'),
('7065-A', 'Vitamin B12 (Cobalamin) and Folate Panel, Serum', 21.75, 'lab', '005 Private Anemia');

-- Package 006 - Private Autoimmune arthropathies
INSERT INTO public.procedures (code, name, price, category, package_name) VALUES
('809', 'Sed Rate by Modified Westergren', 10.46, 'lab', '006 Private Autoimmune'),
('4420', 'C-Reactive Protein (CRP)', 22.50, 'lab', '006 Private Autoimmune'),
('8268', 'ANA Screen, IFA, with Reflex to Titer and Pattern', 87.38, 'lab', '006 Private Autoimmune'),
('37092', 'DNA (ds) Antibody, Crithidia IFA with Reflex to Titer', 126.23, 'lab', '006 Private Autoimmune'),
('17669', 'Rheumatoid Arthritis Diagnostic Panel 1', 112.50, 'lab', '006 Private Autoimmune');

-- Package 007 - Private Pediatric
INSERT INTO public.procedures (code, name, price, category, package_name) VALUES
('4420-P', 'C-Reactive Protein (CRP)', 22.50, 'lab', '007 Private Pediatric'),
('6399', 'CBC (includes Differential and Platelets)', 7.50, 'lab', '007 Private Pediatric'),
('10231-P', 'Comprehensive Metabolic Panel', 12.00, 'lab', '007 Private Pediatric'),
('496-P', 'Hemoglobin A1c', 9.00, 'lab', '007 Private Pediatric'),
('35489', 'Hemoglobinopathy Evaluation', 22.50, 'lab', '007 Private Pediatric'),
('5616-P', 'Iron, TIBC and Ferritin Panel', 29.64, 'lab', '007 Private Pediatric'),
('793-P', 'Reticulocyte Count', 24.00, 'lab', '007 Private Pediatric'),
('19543-P', 'Lipid Panel with Ratios', 11.40, 'lab', '007 Private Pediatric'),
('17306-P', 'Vitamin D, 25-Hydroxy, Total, IA', 49.50, 'lab', '007 Private Pediatric'),
('7065-P', 'Vitamin B12/Folate Serum Panel', 21.75, 'lab', '007 Private Pediatric'),
('58984', 'TSH + Free T4', 34.50, 'lab', '007 Private Pediatric');

-- Package 008 - Private PRE-OP
INSERT INTO public.procedures (code, name, price, category, package_name) VALUES
('1759-PRE', 'CBC (H/H, RBC, INDICES, WBC, PLT)', 11.25, 'lab', '008 Private PRE-OP'),
('10231-PRE', 'Comprehensive Metabolic Panel', 18.00, 'lab', '008 Private PRE-OP'),
('4914', 'Prothrombin w/ INR + PTT', 24.75, 'lab', '008 Private PRE-OP'),
('3020-PRE', 'Urinalysis, Complete w/ Reflex to Culture', 11.25, 'lab', '008 Private PRE-OP');

-- Package 009 - Private WL + VITAMINS
INSERT INTO public.procedures (code, name, price, category, package_name) VALUES
('19593-WL', 'CBC (includes Differential and Platelets) (REFL)', 7.50, 'lab', '009 Private WL + VITAMINS'),
('10231-WL', 'Comprehensive Metabolic Panel', 12.00, 'lab', '009 Private WL + VITAMINS'),
('496-WL', 'Hemoglobin A1c', 9.00, 'lab', '009 Private WL + VITAMINS'),
('561', 'Insulin', 34.44, 'lab', '009 Private WL + VITAMINS'),
('5616-WL', 'Iron, TIBC and Ferritin Panel', 29.64, 'lab', '009 Private WL + VITAMINS'),
('7600', 'Lipid Panel, Standard', 11.40, 'lab', '009 Private WL + VITAMINS'),
('34429', 'T3, Free', 22.50, 'lab', '009 Private WL + VITAMINS'),
('58984-WL', 'TSH and Free T4', 34.50, 'lab', '009 Private WL + VITAMINS'),
('7065-WL', 'Vitamin B12 (Cobalamin) and Folate Panel, Serum', 21.75, 'lab', '009 Private WL + VITAMINS'),
('17306-WL', 'Vitamin D, 25-Hydroxy, Total, Immunoassay', 49.50, 'lab', '009 Private WL + VITAMINS');

-- Private Adrenal
INSERT INTO public.procedures (code, name, price, category, package_name) VALUES
('17180', 'Hydroxyprogesterone', 67.50, 'lab', 'Private Adrenal'),
('367', 'Cortisol, Total', 25.35, 'lab', 'Private Adrenal'),
('402-AD', 'DHEA', 67.50, 'lab', 'Private Adrenal');

-- Private Gastrointestinal
INSERT INTO public.procedures (code, name, price, category, package_name) VALUES
('482', 'Gamma Glutamyl Transferase (GGT)', 22.50, 'lab', 'Private Gastrointestinal'),
('4475', 'Campylobacter, Culture', 102.72, 'lab', 'Private Gastrointestinal'),
('11290', 'Fecal Globin by Immunochemistry', 49.50, 'lab', 'Private Gastrointestinal'),
('14839', 'Helicobacter pylori, Urea Breath Test', 132.00, 'lab', 'Private Gastrointestinal'),
('38470', 'Gastrointestinal Pathogen Panel, Real-Time PCR', 893.37, 'lab', 'Private Gastrointestinal'),
('1748', 'Ova and Parasites with Giardia Antigen', 43.50, 'lab', 'Private Gastrointestinal'),
('6775', 'Amylase and Lipase', 55.50, 'lab', 'Private Gastrointestinal');

-- Private Diabetes
INSERT INTO public.procedures (code, name, price, category, package_name) VALUES
('561-D', 'Insulin [Serum]', 34.44, 'lab', 'Private Diabetes'),
('36509', 'Cardio IQ Insulin Resistance Panel with Score', 72.00, 'lab', 'Private Diabetes'),
('372', 'C-Peptide [Serum]', 82.56, 'lab', 'Private Diabetes'),
('36178', 'Insulin Autoantibody [Serum]', 299.39, 'lab', 'Private Diabetes'),
('39165', 'Kidney Profile', 50.51, 'lab', 'Private Diabetes');

-- Private Gyn/PAP
INSERT INTO public.procedures (code, name, price, category, package_name) VALUES
('8396', 'HCG, Total, Quantitative', 24.00, 'lab', 'Private Gyn/PAP'),
('10016', 'SureSwab Advanced Bacterial Vaginosis (BV), TMA', 135.00, 'lab', 'Private Gyn/PAP'),
('10120', 'SureSwab Advanced Vaginitis Plus, TMA', 361.50, 'lab', 'Private Gyn/PAP'),
('14577', 'Bacterial Vaginosis/Vaginitis Panel', 481.94, 'lab', 'Private Gyn/PAP'),
('91414', 'ThinPrep Automated Pap and HPV mRNA E6/E7 with Reflex', 94.50, 'lab', 'Private Gyn/PAP');

-- Individual lab tests from price list (sheet 3) - unique ones not in packages
INSERT INTO public.procedures (code, name, price, category) VALUES
('7064', 'WBC & DIFF', 3.15, 'lab'),
('937', 'WBC', 0.98, 'lab'),
('319', 'VLDL CHOLESTEROL', 3.60, 'lab'),
('927', 'VITAMIN B12', 11.25, 'lab'),
('7909', 'URINALYSIS, REFLEX', 3.45, 'lab'),
('905', 'URIC ACID', 6.75, 'lab'),
('294', 'UREA NITROGEN (BUN)', 7.01, 'lab'),
('8563', 'UA, MICROSCOPIC', 4.05, 'lab'),
('6448', 'UA, MACROSCOPIC', 3.45, 'lab'),
('5463', 'UA, COMPLETE', 7.50, 'lab'),
('90896', 'TSH, PREGNANCY', 10.50, 'lab'),
('896', 'TRIGLYCERIDES', 3.60, 'lab'),
('19550', 'TRICHOMONAS VAG RNA, QL', 48.00, 'lab'),
('15116', 'TPO AB ENDPOINT', 90.00, 'lab'),
('5081', 'THYROID PEROXID AB', 37.50, 'lab'),
('267', 'THYROGLOBULIN AB', 27.00, 'lab'),
('15983', 'TESTOSTERONE, TOTAL MS', 19.50, 'lab'),
('36170', 'TESTOSTERONE, FREE, DIAL, TOTAL', 33.00, 'lab'),
('866', 'T-4, FREE', 24.00, 'lab'),
('867', 'T-4 (THYROXINE)', 7.58, 'lab'),
('34429-I', 'T-3, FREE', 22.50, 'lab'),
('861', 'T-3 UPTAKE', 9.54, 'lab'),
('836', 'SODIUM', 7.01, 'lab'),
('30740', 'SHBG', 25.50, 'lab'),
('802', 'RUBELLA IMMUNE', 42.00, 'lab'),
('90963', 'RT3 BY LC/MS/MS', 60.00, 'lab'),
('36126', 'RPR(DX) REFL FTA', 10.50, 'lab'),
('4120', 'RPR, PM W/REFL', 10.50, 'lab'),
('799', 'RPR MONITOR W/REFL', 10.50, 'lab'),
('4418', 'RHEUMATOID FACTOR', 7.50, 'lab'),
('10314', 'RENAL FUNC PNL', 10.41, 'lab'),
('783', 'RED BLOOD CELL COUNT', 1.13, 'lab'),
('36971', 'QUANTIFERON PL 4T', 127.50, 'lab'),
('763', 'PTT, ACTIVATED', 9.00, 'lab'),
('35202', 'PTH, INTACT W/O CAL', 67.50, 'lab'),
('31348', 'PSA FREE & TOTAL', 48.00, 'lab'),
('754', 'PROTEIN, TOTAL', 7.01, 'lab'),
('4699', 'PROLACTIN, 5 SPEC', 63.75, 'lab'),
('8847', 'PRO TIME WITH INR', 7.50, 'lab'),
('13595', 'PREP HIV1/2, RFL DIFF', 34.50, 'lab'),
('13696', 'PREP HCG, TOTAL, QN', 24.00, 'lab'),
('13701', 'PREP CT/GC RNA, TMA', 43.50, 'lab'),
('31493', 'PREGNENOLONE LC/MS/MS', 105.00, 'lab'),
('733', 'POTASSIUM', 7.01, 'lab'),
('723', 'PLATELET COUNT', 1.65, 'lab'),
('718', 'PHOSPHATE (AS PHOS)', 7.01, 'lab'),
('615', 'LH', 13.50, 'lab'),
('7573', 'IRON, TOTAL, & IBC', 14.55, 'lab'),
('571', 'IRON, TOTAL', 7.50, 'lab'),
('93103', 'INSULIN, INTACT, LC/MS/MS', 45.00, 'lab'),
('16293', 'IGF I, ECL', 41.00, 'lab'),
('2692', 'HSV CULT', 18.00, 'lab'),
('6447', 'HSV 1/2 IGG TYPE SP', 24.00, 'lab'),
('3636', 'HSV 1 IGG', 12.00, 'lab'),
('3640', 'HSV 2 IGG', 12.00, 'lab'),
('10124', 'HS CRP', 18.00, 'lab'),
('90887', 'HPV RNA HR E6/E7 TMA', 48.00, 'lab'),
('93102', 'HPV GENO 16,18/45', 66.00, 'lab'),
('91431', 'HIV1/2 AG/AB, 4 W/RFL', 34.50, 'lab'),
('10379', 'HGB A1C W/EAG REFL', 9.00, 'lab'),
('8472', 'HEP C AB W/REFL HCV', 14.25, 'lab'),
('498', 'HEP B SURF AG W/CONF', 10.50, 'lab'),
('499', 'HEP B SURF AB QL', 16.50, 'lab'),
('4848', 'HEP B CORE IGM AB', 18.00, 'lab'),
('501', 'HEP B CORE AB, TOTAL', 16.50, 'lab'),
('512', 'HEP A IGM AB', 16.50, 'lab'),
('508', 'HEP A AB, TOTAL', 37.50, 'lab'),
('7210', 'HEMOGRAM & DIFF', 5.93, 'lab'),
('7008', 'HEMOGRAM', 3.90, 'lab'),
('608', 'HDL-CHOLESTEROL', 4.50, 'lab'),
('483', 'GLUCOSE, SERUM', 7.01, 'lab'),
('11362', 'GC RNA, TMA, UROGEN', 21.75, 'lab'),
('470', 'FSH', 13.50, 'lab'),
('466', 'FOLATE, SERUM', 10.50, 'lab'),
('457', 'FERRITIN', 18.00, 'lab'),
('11290-I', 'FECAL IMMUNOCHEM', 49.50, 'lab'),
('15577', 'ESTRADIOL, RAPID', 22.50, 'lab'),
('4021-I', 'ESTRADIOL', 22.50, 'lab'),
('34392', 'ELECTROLYTE PANEL', 8.01, 'lab'),
('3259', 'DRAW FEE, PSC SPEC.', 13.50, 'lab'),
('402-I', 'DHEA-SULFATE', 67.50, 'lab'),
('11363', 'CT/GC RNA, TMA, UROGEN', 43.50, 'lab'),
('11361', 'CT RNA, TMA, UROGEN', 21.75, 'lab'),
('8459', 'CREATININE RAND (U)', 18.00, 'lab'),
('375', 'CREATININE', 7.01, 'lab'),
('36626', 'CPT LC/MS/MS & IR SC', 39.00, 'lab'),
('367-I', 'CORTISOL, TOTAL', 25.35, 'lab'),
('4213', 'CORTISOL, P.M.', 25.35, 'lab'),
('4212', 'CORTISOL, A.M.', 25.35, 'lab'),
('334', 'CHOLESTEROL, TOTAL', 3.30, 'lab'),
('330', 'CHLORIDE', 7.01, 'lab'),
('13525', 'CHLAMYDIA/N. GONORRHOEAE', 43.50, 'lab'),
('11173', 'CCP AB IGG', 105.00, 'lab'),
('1759-I', 'CBC (H/H, RBC, WBC, PLT)', 5.55, 'lab'),
('91737', 'CARDIO IQ HS-CRP', 18.00, 'lab'),
('310', 'CARBON DIOXIDE', 7.01, 'lab'),
('303', 'CALCIUM', 7.01, 'lab'),
('296', 'BUN/CREAT RATIO', 7.20, 'lab'),
('287', 'BILIRUBIN, TOTAL', 7.01, 'lab'),
('7286', 'BILIRUBIN, FRAC.', 7.20, 'lab'),
('285', 'BILIRUBIN, DIRECT', 7.01, 'lab'),
('10165', 'BASIC METAB PNL', 9.62, 'lab'),
('822', 'AST', 7.01, 'lab'),
('5224', 'APOLIPOPROTEIN B', 33.71, 'lab'),
('36578', 'ANTI-PTH AB', 262.50, 'lab'),
('249', 'ANA W/RFX', 9.00, 'lab'),
('243', 'AMYLASE', 10.50, 'lab'),
('823', 'ALT', 7.01, 'lab'),
('234', 'ALKALINE PHOSPHATASE', 7.01, 'lab'),
('223', 'ALBUMIN', 7.01, 'lab'),
('7444', 'THYROID PNL W/TSH', 27.62, 'lab'),
('36963', 'STI INCREASED RISK PANEL', 352.50, 'lab'),
('91034', 'MICROALBUMIN RAND UR', 23.00, 'lab'),
('964', 'MEASLES AB IGG, EIA', 37.50, 'lab'),
('8624', 'MUMPS VIRUS IGG, EIA', 28.50, 'lab'),
('13238', 'MCV AB', 180.00, 'lab'),
('91475', 'M.GENITALIUM, TMA', 92.00, 'lab'),
('8360', 'LYMPH SUBSET PNL 5', 63.00, 'lab'),
('91604', 'LIPO FRACT, ION MOB', 52.50, 'lab'),
('606', 'LIPASE', 45.00, 'lab'),
('93101', 'INSULIN, INTACT, LC/MS/MS', 45.00, 'lab'),
('36504', 'HEP A AB, W/REFL IGM', 37.50, 'lab'),
('94345', 'HCV WITH REFLEXES', 14.25, 'lab'),
('92491', 'H.PYLORI UBT, PEDS', 132.00, 'lab'),
('126111', 'METABOLIC RISK PANEL', 126.11, 'lab'),
('95225', 'HEPATITIS PANEL', 95.25, 'lab'),
('59250', 'HEP PNL ACUTE W/REF', 59.25, 'lab'),
('39165-I', 'KIDNEY PROFILE (Painel)', 50.00, 'lab'),
('72000', 'INSULIN RESIST PNL W/SCO', 72.00, 'lab'),
('BAC-VAG', 'BAC VAGINOSIS RNA', 117.00, 'lab'),
('CAND-VAG', 'CANDIDA VAGINITIS', 100.00, 'lab'),
('1748-I', 'O AND P W/GIARDIA AG', 45.00, 'lab'),
('155000', 'SURESWAB VAG CT/NG', 155.00, 'lab'),
('313000', 'SURESWAB VAG PLUS, TMA', 313.00, 'lab'),
('160000', 'SURESWAB VAG/TRICH/TMA', 160.00, 'lab'),
('LF01', 'Tissue pathology', 91.00, 'lab');
