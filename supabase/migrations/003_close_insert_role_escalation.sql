-- ChrisTech Academy — Close INSERT-time privilege escalation gap
-- Run this AFTER 002_security_fixes.sql
--
-- Gap found: the previous fix (002) only blocked role changes on
-- UPDATE. It missed that "Users can insert own profile" only checks
-- auth.uid() = user_id — it never restricts the `role` VALUE. A
-- student can register normally, then run:
--   supabase.from('profiles').insert({ user_id: myId, email, full_name,
--     role: 'admin', status: 'active' })
-- ...and create a second, self-made admin profile row, or in some
-- flows overwrite their pending insert before the app's own request
-- lands. This closes that door: any client-side insert must have
-- role = 'student', full stop. Only service_role (your own backend)
-- can create an admin profile directly in SQL.
--
-- Same class of bug also existed on `enrollments.status` — a student
-- could self-insert an enrollment as already 'completed'. Closed too.

-- ===========================================
-- FIX: profiles — restrict role on INSERT, not just UPDATE
-- ===========================================

CREATE OR REPLACE FUNCTION prevent_role_self_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.role <> 'student' AND auth.role() <> 'service_role' THEN
      RAISE EXCEPTION 'New profiles must be created with role = student';
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.role IS DISTINCT FROM OLD.role AND auth.role() <> 'service_role' THEN
      RAISE EXCEPTION 'Changing role via client update is not permitted';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_role_self_escalation ON profiles;
CREATE TRIGGER trg_prevent_role_self_escalation
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_role_self_escalation();

-- ===========================================
-- FIX: enrollments — restrict status on INSERT
-- ===========================================
-- "Students can create enrollments" only checks student_id ownership,
-- not status. A student could insert status='completed' directly.

CREATE OR REPLACE FUNCTION enforce_active_enrollment_on_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() <> 'service_role' AND NEW.status <> 'active' THEN
    RAISE EXCEPTION 'Client inserts must have status = active';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_active_enrollment ON enrollments;
CREATE TRIGGER trg_enforce_active_enrollment
  BEFORE INSERT ON enrollments
  FOR EACH ROW
  EXECUTE FUNCTION enforce_active_enrollment_on_insert();
