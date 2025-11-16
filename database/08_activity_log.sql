-- ================================================
-- TABELUL activity_log
-- Tabelul există deja, adăugăm doar indexuri și politici
-- Schema existentă: id (bigint), user_id, affected_user_id, action_type, details, ip_address, user_agent, created_at
-- ================================================

-- Index pentru căutări rapide
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON public.activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_action_type ON public.activity_log(action_type);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON public.activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_affected_user ON public.activity_log(affected_user_id);

-- ================================================
-- RLS POLICIES pentru activity_log
-- ================================================

-- Activează RLS
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Adminii pot vedea toate activitățile
CREATE POLICY "Adminii pot vedea toate activitățile"
    ON public.activity_log FOR SELECT
    TO authenticated
    USING (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

-- Utilizatorii își pot vedea propriile activități
CREATE POLICY "Utilizatorii își văd propriile activități"
    ON public.activity_log FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Doar aplicația poate insera activități (prin service role sau funcții)
CREATE POLICY "Inserare activități"
    ON public.activity_log FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- ================================================
-- FUNCȚIE pentru logare automată
-- ================================================

CREATE OR REPLACE FUNCTION log_activity(
    p_user_id UUID,
    p_action_type TEXT,
    p_affected_user_id UUID DEFAULT NULL,
    p_details JSONB DEFAULT '{}'::jsonb,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
) RETURNS void AS $$
BEGIN
    INSERT INTO public.activity_log (user_id, action_type, affected_user_id, details, ip_address, user_agent)
    VALUES (p_user_id, p_action_type, p_affected_user_id, p_details, p_ip_address, p_user_agent);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- TRIGGER pentru logare automată la crearea cererilor
-- ================================================

CREATE OR REPLACE FUNCTION trigger_log_request_creation()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM log_activity(
        NEW.user_id,
        'create_request',
        NULL,
        jsonb_build_object(
            'entity_type', 'request',
            'entity_id', NEW.id::text,
            'request_type', NEW.request_type,
            'status', NEW.status
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_request_insert
    AFTER INSERT ON public.requests
    FOR EACH ROW
    EXECUTE FUNCTION trigger_log_request_creation();

-- ================================================
-- TRIGGER pentru logare la actualizarea statusului cererii
-- ================================================

CREATE OR REPLACE FUNCTION trigger_log_request_status_update()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        PERFORM log_activity(
            COALESCE(NEW.assigned_clerk_id, NEW.user_id),
            'update_request',
            NEW.user_id,
            jsonb_build_object(
                'entity_type', 'request',
                'entity_id', NEW.id::text,
                'old_status', OLD.status,
                'new_status', NEW.status,
                'request_type', NEW.request_type
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_request_status_update
    AFTER UPDATE ON public.requests
    FOR EACH ROW
    EXECUTE FUNCTION trigger_log_request_status_update();

-- ================================================
-- TRIGGER pentru logare la încărcarea documentelor
-- ================================================

CREATE OR REPLACE FUNCTION trigger_log_document_upload()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Obține user_id din request
    SELECT user_id INTO v_user_id
    FROM public.requests
    WHERE id = NEW.request_id;

    PERFORM log_activity(
        v_user_id,
        'upload_document',
        NULL,
        jsonb_build_object(
            'entity_type', 'document',
            'entity_id', NEW.id::text,
            'document_type', NEW.document_type_ai,
            'request_id', NEW.request_id::text
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_document_insert
    AFTER INSERT ON public.documents
    FOR EACH ROW
    EXECUTE FUNCTION trigger_log_document_upload();

-- ================================================
-- Populare date inițiale pentru testare
-- ================================================

-- Inserează câteva activități de exemplu pentru utilizatorii existenți
-- (se vor completa automat odată ce utilizatorii încep să folosească sistemul)
