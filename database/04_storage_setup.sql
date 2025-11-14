-- ================================================
-- ### 6. POLITICI PENTRU SUPABASE STORAGE ###
-- ================================================
-- Configurare completă pentru bucket-ul 'uploads'

-- Creează bucket-ul dacă nu există
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', FALSE)
ON CONFLICT (id) DO NOTHING;

-- Drop politicile existente pentru a le recrea
DROP POLICY IF EXISTS "Utilizatorii autentificați pot încărca documente" ON storage.objects;
DROP POLICY IF EXISTS "Acces la fișierele din uploads" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;

-- Politica 1: Utilizatorii autentificați pot încărca documente
CREATE POLICY "Utilizatorii autentificați pot încărca documente"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'uploads');

-- Politica 2: Acces la vizualizare fișiere
-- Utilizatorii văd doar documentele legate de cererile lor
-- Funcționarii și adminii văd toate documentele
CREATE POLICY "Acces la fișierele din uploads"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'uploads'
        AND (
            -- Funcționarii și adminii au acces complet
            (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('clerk', 'admin')
            OR
            -- Utilizatorul vede doar documentele legate de cererile lui
            EXISTS (
                SELECT 1
                FROM public.documents
                JOIN public.requests
                    ON public.requests.id = public.documents.request_id
                WHERE public.documents.storage_path = storage.objects.name
                    AND public.requests.user_id = auth.uid()
            )
        )
    );

-- Politica 3: Utilizatorii pot șterge propriile fișiere
CREATE POLICY "Users can delete their own files"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'uploads'
        AND EXISTS (
            SELECT 1
            FROM public.documents
            JOIN public.requests
                ON public.requests.id = public.documents.request_id
            WHERE public.documents.storage_path = storage.objects.name
                AND public.requests.user_id = auth.uid()
        )
    );

-- Politica 4: Utilizatorii pot actualiza propriile fișiere
CREATE POLICY "Users can update their own files"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'uploads'
        AND EXISTS (
            SELECT 1
            FROM public.documents
            JOIN public.requests
                ON public.requests.id = public.documents.request_id
            WHERE public.documents.storage_path = storage.objects.name
                AND public.requests.user_id = auth.uid()
        )
    );
