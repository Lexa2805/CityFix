-- ================================================
-- FIX: Trigger pentru logare document upload
-- ================================================
-- Problema: trigger-ul folosea NEW.document_type dar coloana corectă este NEW.document_type_ai

DROP TRIGGER IF EXISTS after_document_insert ON public.documents;
DROP FUNCTION IF EXISTS trigger_log_document_upload();

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
            'document_type', NEW.document_type_ai,  -- ✅ FIXAT: document_type_ai în loc de document_type
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
