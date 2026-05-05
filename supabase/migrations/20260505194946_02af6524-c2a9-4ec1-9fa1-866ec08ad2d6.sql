
DO $$
DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'opportunity_types','opportunity_categories','opportunity_statuses',
    'visibility_types','match_types','teams','territories'
  ]) LOOP
    BEGIN
      EXECUTE format('ALTER TABLE public.%I ADD CONSTRAINT %I UNIQUE (code)', t, t||'_code_uq');
    EXCEPTION WHEN duplicate_object THEN NULL;
             WHEN duplicate_table THEN NULL;
             WHEN undefined_column THEN NULL;
    END;
  END LOOP;
END $$;
