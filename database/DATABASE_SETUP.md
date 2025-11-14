# Setup Database și Storage pentru CityFix

## 📋 Ordine de execuție scripturi SQL

Rulează scripturile în următoarea ordine în **Supabase SQL Editor**:

### 1. Schema principală
```sql
-- Rulează: database/01_schema.sql
```
Creează toate tabelele (profiles, requests, documents, knowledge_base) cu extensiile necesare (PostGIS, pgvector) și RLS policies.

### 2. Trigger pentru profile automate
```sql
-- Rulează: database/02_auto_create_profile_trigger.sql
```
Creează automat un profil când un user nou se înregistrează. Include și migrarea utilizatorilor existenți.

### 3. Fix RLS policies (dacă întâmpini probleme)
```sql
-- Rulează: database/03_fix_rls_policies.sql
```
Corectează politicile RLS pentru a evita recursivitatea infinită. Schema ta folosește deja politici corecte.

### 4. **Configurare Supabase Storage** ⭐
```sql
-- Rulează: database/04_storage_setup.sql
```
Creează bucket-ul `uploads` și configurează politicile de acces bazate pe rol.

---

## 🗂️ Verificare Supabase Storage

După ce rulezi scripturile, verifică în **Supabase Dashboard**:

### 1. Verifică bucket-ul
- Mergi la **Storage** → **Buckets**
- Ar trebui să vezi bucket-ul `uploads`
- Configurare:
  - **Public:** No (privat)
  - **File size limit:** 10MB
  - **Allowed MIME types:** PDF, JPG, PNG, DOC, DOCX

### 2. Verifică policies
- Click pe bucket-ul `uploads`
- Mergi la **Policies**
- Ar trebui să vezi:
  - ✅ Authenticated users can upload files
  - ✅ Users can view their own files
  - ✅ Clerks and admins can view all files
  - ✅ Users can delete their own files
  - ✅ Users can update their own files

### 3. Test upload manual (opțional)
- În **Storage** → `uploads`
- Click **Upload file**
- Încearcă să uploadezi un fișier test
- Verifică că apare în structura: `{user_id}/...`

---

## 🧪 Testare aplicație

### 1. Pornește serverul de dezvoltare
```bash
cd web
npm run dev
```

### 2. Creează o cerere nouă
1. Autentifică-te ca **citizen**
2. Mergi la **Cerere Nouă**
3. Completează cele 3 pașii:
   - **Pas 1:** Selectează tipul cererii
   - **Pas 2:** Completează detaliile (adresă obligatorie)
   - **Pas 3:** Încarcă documente (PDF, JPG, PNG, DOC max 10MB)
4. Click **Trimite cererea**

### 3. Verifică în Supabase Dashboard
- **Table Editor** → `requests` - ar trebui să vezi cererea creată
- **Table Editor** → `documents` - ar trebui să vezi documentele încărcate
- **Storage** → `uploads` → `{user_id}` → `{request_id}` - ar trebui să vezi fișierele

---

## 🔧 Troubleshooting

### Eroare: "Policy violation" la upload
**Soluție:** Asigură-te că ai rulat `04_storage_setup.sql`

### Eroare: "Bucket not found"
**Soluție:** 
1. Mergi la **Supabase Dashboard** → **Storage**
2. Creează manual bucket-ul `uploads` (fără "public")
3. Rulează din nou `04_storage_setup.sql` pentru policies

### Eroare: "File type not allowed"
**Soluție:** Verifică că tipul fișierului este: PDF, JPG, PNG, DOC, DOCX

### Eroare: "File too large"
**Soluție:** Fișierul depășește 10MB - comprimă sau folosește un fișier mai mic

---

## 📊 Structura bucket-ului

```
uploads/
├── {user_id_1}/
│   ├── {request_id_1}/
│   │   ├── timestamp-random.pdf
│   │   └── timestamp-random.jpg
│   └── {request_id_2}/
│       └── timestamp-random.pdf
└── {user_id_2}/
    └── {request_id_3}/
        └── timestamp-random.docx
```

Fiecare fișier este stocat în:
```
uploads/{user_id}/{request_id}/{timestamp-random}.{ext}
```

---

## ✅ Checklist final

- [ ] Schema creată (`01_schema.sql`)
- [ ] Trigger profile automat (`02_auto_create_profile_trigger.sql`)
- [ ] RLS policies fixate (`03_fix_rls_policies.sql`)
- [ ] **Bucket uploads creat și configurat** (`04_storage_setup.sql`)
- [ ] Test: Creează cerere nouă ca citizen
- [ ] Test: Upload documente
- [ ] Test: Vezi cererea în `/citizen/requests`
- [ ] Verifică în Supabase Dashboard: requests, documents, storage

---

## 🎯 Next Steps

Odată ce totul funcționează:
1. **Validare AI documente** - Integrare cu backend Python pentru validarea documentelor
2. **Queue clerk** - Interfață pentru clerk să proceseze cererile
3. **GIS Map** - Vizualizare pe hartă a cererilor
4. **RAG Chatbot** - Asistent AI pentru întrebări despre legislație
