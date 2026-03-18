-- =============================================================
-- SCHEMA ADDITIONS (run after schema.sql if needed)
-- Adds unique constraint so upsert works in budgetController
-- =============================================================

-- Ensure each user has only one budget row (required for ON CONFLICT upsert)
ALTER TABLE budgets ADD CONSTRAINT budgets_user_id_unique UNIQUE (user_id);
