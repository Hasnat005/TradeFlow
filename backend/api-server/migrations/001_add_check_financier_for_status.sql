ALTER TABLE financing_requests
ADD CONSTRAINT check_financier_for_status
CHECK (
  status NOT IN ('approved', 'disbursed', 'repaid')
  OR financier_org_id IS NOT NULL
);
