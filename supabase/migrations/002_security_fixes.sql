-- ChrisTech Academy — Security & Registration Fixes
-- Run this AFTER 001_initial_schema.sql
--
-- Fixes two critical issues found in audit:
-- 1. Registration is broken: no self-serve INSERT policy on `profiles`
--    or `students`, so RLS silently blocks every signup.
-- 2. Privilege escalation: "Users can update own profile" and
--    "Students can insert payments" restrict which ROW a student can
--    touch, but not which COLUMNS/VALUES — a student can currently
--    set role='admin' or insert a payment with status='successful'.

-- ===========================================
-- FIX 1: Allow self-serve INSERT on registration
-- ===========================================

-- A newly signed-up user needs to create their own profile row.
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- A newly signed-up user needs to create their own student record.
-- students.profile_id references profiles(user_id), so this must
-- match the same auth.uid() the profile insert used.
CREATE POLICY "Users can insert own student record" ON students
  FOR INSERT WITH CHECK (profile_id = auth.uid());

-- ===========================================
-- FIX 2a: Block self-role-escalation on profiles.role
-- ===========================================
-- RLS policies can only restrict which rows are touched, not which
-- columns change within an allowed row. A trigger is required to stop
-- a student from setting role='admin' via the existing (necessary)
-- "Users can update own profile" policy.

CREATE OR REPLACE FUNCTION prevent_role_self_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role AND auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'Changing role via client update is not permitted';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_role_self_escalation ON profiles;
CREATE TRIGGER trg_prevent_role_self_escalation
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_role_self_escalation();

-- ===========================================
-- FIX 2b: Block forged payment status on insert
-- ===========================================
-- Same problem: "Students can insert payments" doesn't restrict
-- `status`, so a client insert with status='successful' would pass
-- RLS. verify-payment and paystack-webhook (both using the service
-- role key) are the only things allowed to mark a payment successful.

CREATE OR REPLACE FUNCTION enforce_pending_payment_on_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() <> 'service_role' AND NEW.status <> 'pending' THEN
    RAISE EXCEPTION 'Client inserts must have status = pending';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_pending_payment ON payments;
CREATE TRIGGER trg_enforce_pending_payment
  BEFORE INSERT ON payments
  FOR EACH ROW
  EXECUTE FUNCTION enforce_pending_payment_on_insert();
