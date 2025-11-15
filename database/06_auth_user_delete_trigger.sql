-- ============================================
-- TRIGGER: Șterge din profiles când ștergi din auth.users
-- ============================================
-- Acest script creează UN SINGUR trigger pentru a evita bucla infinită
-- Când API-ul șterge din auth.users → trigger-ul șterge automat din profiles

-- ============================================
-- CURĂȚARE: Șterge trigger-ele vechi (dacă există)
-- ============================================
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
DROP TRIGGER IF EXISTS on_profile_deleted ON public.profiles;
DROP FUNCTION IF EXISTS public.handle_auth_user_deleted();
DROP FUNCTION IF EXISTS public.handle_profile_deleted();

-- ============================================
-- TRIGGER NOU: Șterge doar din profiles când ștergi din auth.users
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_auth_user_deleted()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Șterge profilul când user-ul este șters din Authentication
  -- CASCADE va șterge automat: requests, documents, chat_messages
  DELETE FROM public.profiles WHERE id = OLD.id;
  RETURN OLD;
END;
$$;

CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_auth_user_deleted();

-- ============================================
-- VERIFICARE: Testează că trigger-ul este activ
-- ============================================
SELECT 
    trigger_name,
    event_manipulation,
    event_object_schema,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_deleted';

-- ============================================
-- INSTRUCȚIUNI DE UTILIZARE:
-- ============================================
-- 1. Copiază tot acest script
-- 2. Deschide Supabase Dashboard → SQL Editor
-- 3. Lipește și rulează script-ul (Ctrl+Enter sau click Run)
-- 4. Verifică că vezi 1 trigger în rezultat
--
-- DUPĂ INSTALARE:
-- ✅ API șterge din Authentication → trigger șterge automat din profiles
-- ✅ CASCADE șterge automat: requests, documents, chat_messages, etc.
-- ✅ NU mai există buclă infinită (doar o direcție de ștergere)
--
-- ⚠️ ATENȚIE: Ștergerea este IREVERSIBILĂ!
-- ============================================
