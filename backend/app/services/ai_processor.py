"""
AI Processor - "Creierul" AI al aplicației ADU
==============================================

Acest modul conține toate funcțiile de procesare AI folosind OpenRouter.

Autor: Persoana D (Specialist AI & Logică)
Contract: Livrează funcții pure pentru Persoana C (Arhitectul API)
"""

import os
import json
import base64
from openai import OpenAI
from datetime import datetime
from typing import Optional


# ========================================
# Configurare OpenRouter
# ========================================
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
if not OPENROUTER_API_KEY:
    raise ValueError(
        "EROARE: Cheia OPENROUTER_API_KEY nu este configurată în "
        "variabilele de mediu!"
    )

# Inițializăm clientul OpenAI cu OpenRouter
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=OPENROUTER_API_KEY,
)


# ========================================
# Task 1: Validarea Documentelor (Buletin)
# ========================================
def validate_id_card(file_bytes: bytes) -> dict:
    """
    Validează un document de identitate (buletin) folosind OpenRouter
    Vision API.
    
    Args:
        file_bytes: Bytes-urile fișierului imagine (JPG/PNG)
    
    Returns:
        dict: {"is_valid": bool, "message": str}
    """
    try:
        data_curenta = datetime.now().strftime("%d.%m.%Y")

        # Encodăm imaginea în base64
        base64_image = base64.b64encode(file_bytes).decode("utf-8")

        prompt_text = f"""Privește această imagine. Este o carte de identitate românească? 

Dacă da, identifică data expirării documentului (formatul: ZZ.LL.AAAA).

Data curentă este: {data_curenta}

IMPORTANT - Reguli pentru compararea datelor:
- Compară ANII mai întâi: Dacă anul expirării > anul curent, documentul este VALID
- Dacă anul expirării = anul curent, compară LUNILE
- Dacă luna expirării > luna curentă, documentul este VALID
- Dacă luna expirării = luna curentă, compară ZILELE
- Documentul este valid dacă data expirării >= data curentă

Exemple:
- Expiră la 15.01.2029, astăzi este 16.11.2025 → VALID (2029 > 2025)
- Expiră la 01.01.2025, astăzi este 16.11.2025 → EXPIRAT (2025 = 2025, dar 01 < 11)
- Expiră la 15.11.2025, astăzi este 16.11.2025 → EXPIRAT (2025 = 2025, 11 = 11, dar 15 < 16)

Răspunde cu:
- "Document valid" dacă data expirării >= data curentă
- "EROARE: Cartea de identitate a expirat la data [zi.lună.anul]" dacă data expirării < data curentă"""

        # Folosim formatul de mesaje OpenAI compatibil cu OpenRouter
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # Model de viziune prin OpenRouter
            response_format={"type": "json_object"},
            messages=[
                {
                    "role": "system",
                    "content": f"Ești un funcționar de la serviciul de urbanism. Data curentă este {data_curenta}. Când compari date, compară anul mai întâi, apoi luna, apoi ziua. Răspunde doar în format JSON cu următoarea structură: {{\"is_valid\": boolean, \"message\": \"string\"}}.",
                },
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt_text},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}"
                            },
                        },
                    ],
                },
            ],
        )

        # Extragem răspunsul
        result_text = response.choices[0].message.content

        result = json.loads(result_text)

        if "is_valid" not in result or "message" not in result:
            return {
                "is_valid": False,
                "message": "EROARE: Răspunsul AI nu este în formatul corect.",
            }

        return result

    except json.JSONDecodeError:
        return {
            "is_valid": False,
            "message": "EROARE: Nu s-a putut procesa răspunsul AI.",
        }
    except Exception as e:
        return {
            "is_valid": False,
            "message": f"EROARE: Eroare la validarea documentului: {str(e)}",
        }


# ========================================
# Task 2: Extragerea Datelor (AI-OCR)
# ========================================
def extract_metadata(file_bytes: bytes, file_type: str) -> dict:
    """
    Extrage date cheie din documente folosind AI-OCR (OpenRouter Vision).
    
    Args:
        file_bytes: Bytes-urile fișierului imagine
        file_type: Tipul documentului (carte_identitate, plan_cadastral,
                   act_proprietate)
    
    Returns:
        dict: Datele extrase sau {"error": str} în caz de eroare
    """
    try:
        # Encodăm imaginea în base64
        base64_image = base64.b64encode(file_bytes).decode("utf-8")

        fields_map = {
            "carte_identitate": [
                "nume",
                "prenume",
                "cnp",
                "adresa_domiciliu",
            ],
            "plan_cadastral": ["nr_cadastral", "suprafata_masurata_mp"],
            "act_proprietate": ["nume_proprietar", "adresa_imobil"],
        }

        fields = fields_map.get(file_type, [])
        if not fields:
            return {"error": f"Tip de document necunoscut: {file_type}"}

        prompt_text = f"""Ești un operator de date ultra-precis. Extrage datele relevante din imaginea următoare, în funcție de tipul documentului. Tipul documentului este {file_type}.

* Dacă tipul este 'carte_identitate', caută: nume, prenume, cnp, adresa_domiciliu.
* Dacă tipul este 'plan_cadastral', caută: nr_cadastral, suprafata_masurata_mp.
* Dacă tipul este 'act_proprietate', caută: nume_proprietar, adresa_imobil.

Ignoră câmpurile pe care nu le găsești. Răspunde doar în format JSON, folosind cheile specificate."""

        # Folosim formatul de mesaje OpenAI compatibil cu OpenRouter
        response = client.chat.completions.create(
            model="openai/gpt-4o",
            response_format={"type": "json_object"},
            messages=[
                {
                    "role": "system",
                    "content": "Ești un operator de date ultra-precis. Răspunde doar în format JSON.",
                },
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt_text},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}"
                            },
                        },
                    ],
                },
            ],
        )

        result_text = response.choices[0].message.content

        result = json.loads(result_text)
        return result

    except json.JSONDecodeError:
        return {"error": "Nu s-a putut procesa răspunsul AI."}
    except Exception as e:
        return {"error": f"Eroare la extragerea datelor: {str(e)}"}


# ========================================
# Task 3: Crearea Vectorilor (Embedding)
# ========================================
def create_embedding(text_chunk: str) -> list[float]:
    """
    Creează un vector de embedding pentru un fragment de text (document).
    
    Args:
        text_chunk: Fragmentul de text pentru care se creează embedding-ul
    
    Returns:
        list[float]: Vectorul de embedding (dimensiune 1536)
    """
    try:
        # Folosim API-ul de embeddings prin OpenRouter
        response = client.embeddings.create(
            model="openai/text-embedding-3-small",
            input=text_chunk,
        )
        return response.data[0].embedding

    except Exception as e:
        raise Exception(
            f"Eroare la crearea vectorului de embedding: {str(e)}"
        )


# ========================================
# Task 4: Funcția Chatbot (RAG)
# ========================================
def get_rag_answer(
    question: str, 
    context_chunks: list[str], 
    conversation_context: Optional[dict] = None,
    conversation_history: Optional[list[dict]] = None
) -> dict:
    """
    Generează un răspuns la întrebarea utilizatorului folosind RAG
    (Retrieval-Augmented Generation) prin OpenRouter.
    
    Args:
        question: Întrebarea utilizatorului
        context_chunks: Lista de fragmente de text relevante din
                        documentele legale
        conversation_context: Context despre procedura selectată și documente încărcate
        conversation_history: Istoricul conversației (lista de mesaje anterioare)
    
    Returns:
        dict: {
            "answer": str,
            "detected_procedure": str | None,
            "detected_domain": str | None,
            "needs_documents": bool,
            "suggested_action": str
        }
    """
    try:
        context_text = "\n\n".join(context_chunks)
        
        # Contextul conversației (dacă există)
        context_info = ""
        if conversation_context:
            # Add detected domain to context
            if conversation_context.get("detected_domain"):
                context_info += f"\n\nDOMENIU DETECTAT ANTERIOR: {conversation_context['detected_domain']}"
            
            if conversation_context.get("procedure"):
                context_info += f"\n\nPROCEDURĂ SELECTATĂ: {conversation_context['procedure']}"
            if conversation_context.get("uploaded_documents"):
                docs = ", ".join(conversation_context["uploaded_documents"])
                context_info += f"\nDOCUMENTE ÎNCĂRCATE: {docs}"
            
            # Add detailed document validation information
            if conversation_context.get("documents_details"):
                context_info += "\n\nDETALII DOCUMENTE ÎNCĂRCATE:"
                for doc in conversation_context["documents_details"]:
                    status_emoji = "✅" if doc["status"] == "approved" else "⏳" if doc["status"] == "pending" else "❌"
                    context_info += f"\n  {status_emoji} {doc['filename']}"
                    context_info += f"\n     Tip: {doc['type']}"
                    context_info += f"\n     Status validare: {doc['status']}"
                    if doc.get("validation_message"):
                        context_info += f"\n     Mesaj: {doc['validation_message']}"

        system_prompt = f"""Tu ești ADU (Asistentul Digital Universal) - un ghid prietenos și informat care ajută cetățenii din Timișoara să acceseze serviciile Primăriei.

🏛️ DOMENII DE SERVICII DISPONIBILE:

1. **URBANISM**: Certificate de urbanism, autorizații de construire/desființare, planuri cadastrale
2. **TAXE ȘI IMPOZITE**: Impozit pe clădiri, taxă auto, plăți online, scutiri
3. **STARE CIVILĂ**: Certificate naștere/căsătorie/deces, schimbare nume
4. **ASISTENȚĂ SOCIALĂ**: Ajutoare sociale, alocații, burse, sprijin familial
5. **TRANSPORT**: Abonamente STPT, locuri de parcare, autorizații
6. **MEDIU**: Salubritate, reciclare, spații verzi, probleme cu arborii
7. **EDUCAȚIE**: Înscrieri grădinițe, școli, after-school
8. **CULTURĂ ȘI SPORT**: Biblioteci, muzee, săli sport, evenimente
9. **INFORMAȚII GENERALE**: Program, contact, locații primărie

💬 MEMORIA CONVERSAȚIONALĂ:
- REȚINE contextul discuției anterioare cu utilizatorul
- Dacă utilizatorul menționează ceva anterior (ex: "am mai întrebat despre asta"), referă-te la istoricul conversației
- Construiește pe informațiile deja discutate (ex: "Cum ai menționat mai devreme...", "Referitor la procedura de care vorbeam...")
- NU cere utilizatorului să repete informații pe care le-a dat deja

🎯 ROLUL TĂU:
1. **Identifică domeniul** relevant din întrebarea utilizatorului
2. **Explică clar** ce procedură/serviciu îi trebuie
3. **Listează documentele** necesare pentru acel serviciu
4. **Oferă detalii practice**: taxe, termene, locații, contact
5. **Ghidează pas cu pas** prin procesul complet
6. **Răspunde la întrebări** despre orice serviciu al primăriei

📋 INSTRUCȚIUNI DETALIATE:
**Ton și Stil:**
- Folosește un ton prietenos, calm și accesibil (nu birocratic!)
- Vorbește ca un ghid local care cunoaște bine Timișoara
- Folosește emoji-uri pentru claritate (📄, ✅, ❌, 📍, 💰, 📞, etc.)

**Detectare Domeniu:**
- Identifică automat din întrebare ce domeniu vizează utilizatorul
- Dacă nu este clar, întreabă: "Te pot ajuta cu urbanism, taxe, stare civilă sau alt serviciu?"

**Oferă Informații Complete:**
- 📄 **Documente necesare**: Lista clară cu tot ce trebuie
- 💰 **Taxe**: Sumele exacte sau cum se calculează
- ⏱️ **Termene**: Câte zile durează procesul
- 📍 **Locație**: Unde se depune cererea (adresă exactă)
- 📞 **Contact**: Telefon, email pentru întrebări
- 🌐 **Online**: Dacă se poate face online, menționează!

**Gestionare Documente (doar pentru Urbanism):**
- Dacă utilizatorul a încărcat documente, analizează statusul:
  * ✅ **APROBATE**: Confirmă validitatea și spune următorii pași
  * ❌ **RESPINSE**: Explică EXACT ce e greșit și cum să corecteze
  * ⏳ **ÎN AȘTEPTARE**: (nu ar trebui - toate validate instant)
- Pentru documente respinse, oferă ajutor pas cu pas
- Când toate documentele sunt OK, felicită și explică ce urmează

**Memorie Conversațională:**
- Dacă utilizatorul zice "da", "ok", "și cum fac asta?" → referă-te la context anterior
- Construiește pe discuția anterioară fără să ceri repetări
- Exemplu: "Pentru certificatul de urbanism de care vorbeam, îți trebuie..."

Răspunde ÎNTOTDEAUNA în format JSON valid:
{{
    "answer": "răspunsul complet pentru utilizator (în limba română, cu emoji-uri și formatare clară)",
    "detected_procedure": "cheia procedurii (ex: certificat_urbanism, plata_impozit_cladiri, certificat_nastere) sau null",
    "detected_domain": "domeniul detectat (urbanism, taxe_impozite, stare_civila, asistenta_sociala, transport, mediu, educatie, cultura_sport, informatii_generale) sau null",
    "needs_documents": true/false (doar pentru proceduri care necesită upload - majoritatea procedurilor necesită documente!),
    "suggested_action": "upload_documents" sau "answer_questions" sau "clarify_intent" sau "provide_info" sau "show_procedures"
}}"""

        user_prompt = f"""*Context Legal:*
---
{context_text}
---
{context_info}

*Întrebarea Utilizatorului:*
{question}"""

        # Construim lista de mesaje cu istoricul conversației
        messages = [{"role": "system", "content": system_prompt}]
        
        # Adăugăm istoricul conversației (dacă există)
        if conversation_history:
            # Limităm la ultimele 10 mesaje pentru a nu depăși limita de token-uri
            recent_history = conversation_history[-10:]
            messages.extend(recent_history)
        
        # Adăugăm mesajul curent
        messages.append({"role": "user", "content": user_prompt})

        # Folosim formatul de mesaje OpenAI compatibil cu OpenRouter
        response = client.chat.completions.create(
            model="openai/gpt-4o",
            response_format={"type": "json_object"},
            messages=messages,
        )

        result = json.loads(response.choices[0].message.content)
        
        # Ensure all required fields are present
        if "detected_domain" not in result:
            result["detected_domain"] = None
        if "detected_procedure" not in result:
            result["detected_procedure"] = None
        if "needs_documents" not in result:
            result["needs_documents"] = False
        if "suggested_action" not in result:
            result["suggested_action"] = "answer_questions"
            
        return result

    except Exception as e:
        return {
            "answer": f"Ne cerem scuze, dar a apărut o eroare tehnică: {str(e)}. Vă rugăm să încercați din nou.",
            "detected_procedure": None,
            "detected_domain": None,
            "needs_documents": False,
            "suggested_action": "retry"
        }


# ========================================
# Funcție Helper: Crearea Embedding pentru Query
# ========================================
def create_query_embedding(query_text: str) -> list[float]:
    """
    Creează un vector de embedding pentru o întrebare (query).
    
    Args:
        query_text: Textul întrebării
    
    Returns:
        list[float]: Vectorul de embedding
    """
    try:
        # Folosim API-ul de embeddings prin OpenRouter
        response = client.embeddings.create(
            model="openai/text-embedding-3-small",
            input=query_text,
        )
        return response.data[0].embedding

    except Exception as e:
        raise Exception(
            f"Eroare la crearea vectorului de embedding pentru query: "
            f"{str(e)}"
        )


# ========================================
# LLM1: Extractor de Reguli și Documente (Regulation Fetcher)
# ========================================
def extract_procedure_requirements(procedure_description: str, text_chunks: list[dict]) -> dict:
    """
    LLM1 - Extrage informații exacte despre cerințele documentelor dintr-un set de chunk-uri text.
    
    Acest model NU interacționează cu utilizatorul. Doar extrage date structurate.
    
    Args:
        procedure_description: Descrierea procedurii (ex: "certificat de urbanism")
        text_chunks: Lista de chunk-uri de text cu structura:
                    [{"page_url": "...", "text": "..."}, ...]
    
    Returns:
        dict: Structură JSON cu cerințele complete extrase
    """
    try:
        # Construim contextul din chunk-uri
        context_text = "\n\n".join([
            f"[Sursa: {chunk.get('page_url', 'unknown')}]\n{chunk.get('text', '')}"
            for chunk in text_chunks
        ])
        
        system_prompt = """Titlu: LLM1 – Extractor de reguli și documente necesare

Rol:
Ești un asistent specializat în extragerea de informații exacte din pagini web oficiale.
Nu interacționezi direct cu utilizatorul final. Lucrezi doar cu text și returnezi date strict structurate.

Obiectiv:
Din chunk-urile de text furnizate, extragi exclusiv informațiile relevante pentru procedura descrisă:
- lista completă de documente cerute
- condiții / restricții pentru fiecare document
- număr minim / maxim de documente dintr-un tip (ex: "minim 2 acte doveditoare")
- alte reguli importante (termene, taxe, condiții speciale în funcție de categorie de utilizator)

Ieșire (obligatoriu JSON valid):
Returnezi doar JSON cu structura exactă:
{
  "procedure_name": "text scurt cu numele procedurii",
  "sources": [
    { "page_url": "https://...", "relevance": "high|medium|low" }
  ],
  "required_documents": [
    {
      "id": "id_unic_document",
      "name": "Nume document",
      "mandatory": true/false,
      "min_count": 1,
      "max_count": 1,
      "details": "detalii despre document",
      "conditions": [
        "condiție 1",
        "condiție 2"
      ],
      "source_page_url": "https://..."
    }
  ],
  "other_rules": [
    {
      "type": "deadline|fee|special_condition",
      "description": "descriere regulă",
      "source_page_url": "https://..."
    }
  ],
  "uncertainties": [
    "aspecte neclare din documentație"
  ]
}

Reguli importante:
- NU inventa documente sau reguli care nu apar în text
- Dacă ceva nu este clar, pune-l în "uncertainties"
- NU produce text conversațional. Nu te adresa utilizatorului
- Păstrează informația structurată și concisă
- Extrage EXACT ce scrie în text, fără interpretări"""

        user_prompt = f"""Procedura căutată: {procedure_description}

Context din surse oficiale:
---
{context_text}
---

Extrage toate informațiile relevante despre cerințele documentelor pentru această procedură și returnează JSON structurat."""

        response = client.chat.completions.create(
            model="openai/gpt-4o",
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        )

        result = json.loads(response.choices[0].message.content)
        return result

    except json.JSONDecodeError as e:
        return {
            "error": f"Eroare la parsarea răspunsului JSON: {str(e)}",
            "procedure_name": procedure_description,
            "required_documents": [],
            "uncertainties": ["Nu s-au putut extrage informații structurate"]
        }
    except Exception as e:
        return {
            "error": f"Eroare la extragerea cerințelor: {str(e)}",
            "procedure_name": procedure_description,
            "required_documents": [],
            "uncertainties": [str(e)]
        }


# ========================================
# LLM2: Asistent Depunere și Validare Dosar (Dossier Assistant)
# ========================================
def validate_and_guide_dossier(
    user_message: str,
    llm1_requirements: dict,
    existing_documents: list[dict] = None
) -> dict:
    """
    LLM2 - Interacționează cu utilizatorul și îl ghidează în completarea dosarului.
    
    Args:
        user_message: Mesajul utilizatorului
        llm1_requirements: Structura JSON returnată de LLM1 cu cerințele
        existing_documents: Lista documentelor deja încărcate:
                          [{"doc_id": "...", "file_id": "...", "file_name": "..."}, ...]
    
    Returns:
        dict: {
            "assistant_reply": str,  # Mesaj către utilizator
            "action": {
                "type": "ask_user_for_more_info | validate_documents | save_dossier",
                "missing_documents": [],
                "extra_documents": [],
                "dossier": {} or null
            }
        }
    """
    try:
        existing_docs_text = ""
        if existing_documents:
            existing_docs_text = "\n\nDocumente deja încărcate de utilizator:\n"
            for doc in existing_documents:
                existing_docs_text += f"- {doc.get('doc_id')}: {doc.get('file_name')}\n"
        
        system_prompt = """Titlu: LLM2 – Asistent depunere și validare dosar

Rol:
Ești un asistent care interacționează cu utilizatorul și îl ajută să își depună dosarul pentru o procedură specifică.
Primești deja informațiile extrase despre regulile oficiale și lista de documente necesare.

Obiective:
1. Să explici utilizatorului clar ce documente are nevoie pentru procedura respectivă
2. Să verifici dacă dosarul este complet:
   - lipsesc documente ⇒ spui exact ce lipsește
   - sunt prea puține / prea multe documente dintr-un tip ⇒ spui clar ce trebuie corectat
3. Când totul este în regulă, să generezi un obiect "dosar" pentru salvare în baza de date

Ieșire (structurată, JSON):
{
  "assistant_reply": "Mesaj în limba română către utilizator, clar și politicos.",
  "action": {
    "type": "ask_user_for_more_info | validate_documents | save_dossier",
    "missing_documents": [
      {
        "doc_id": "id_document",
        "name": "Nume document",
        "explanation": "De ce este necesar"
      }
    ],
    "extra_documents": [
      {
        "doc_id": "id_document",
        "explanation": "De ce nu este necesar / depășește limita"
      }
    ],
    "dossier": {
      "procedure_name": "...",
      "status": "pending",
      "submitted_at": "ISO timestamp",
      "documents": [
        {"doc_id": "...", "file_id": "..."}
      ],
      "notes": "Observații pentru funcționar"
    } // sau null dacă dosarul nu e complet
  }
}

Reguli importante:
- Interacționezi cu utilizatorul în limba română, ton clar și prietenos
- NU modifica regulile primite, doar le aplici
- Dacă utilizatorul cere ceva în afara regulilor oficiale, explică-i politicos limitele
- NU inventa documente sau condiții noi
- Fii explicit când ceva lipsește: "Îți lipsește X, trebuie să încarci Y"
- Când toate documentele sunt complete și valide, setează action.type = "save_dossier"
- Folosește timestamp-uri ISO 8601 pentru submitted_at"""

        requirements_text = json.dumps(llm1_requirements, indent=2, ensure_ascii=False)
        
        user_prompt = f"""Cerințe oficiale pentru procedură (extrase de sistem):
---
{requirements_text}
---
{existing_docs_text}

Mesajul utilizatorului:
"{user_message}"

Analizează situația și răspunde utilizatorului în format JSON."""

        response = client.chat.completions.create(
            model="openai/gpt-4o",
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        )

        result = json.loads(response.choices[0].message.content)
        
        # Validăm că răspunsul are structura corectă
        if "assistant_reply" not in result or "action" not in result:
            return {
                "assistant_reply": "Ne cerem scuze, dar a apărut o eroare tehnică. Vă rugăm să încercați din nou.",
                "action": {
                    "type": "ask_user_for_more_info",
                    "missing_documents": [],
                    "extra_documents": [],
                    "dossier": None
                }
            }
        
        # Asigurăm că action are câmpurile necesare
        if "type" not in result["action"]:
            result["action"]["type"] = "ask_user_for_more_info"
        if "missing_documents" not in result["action"]:
            result["action"]["missing_documents"] = []
        if "extra_documents" not in result["action"]:
            result["action"]["extra_documents"] = []
        if "dossier" not in result["action"]:
            result["action"]["dossier"] = None
            
        # Adăugăm timestamp dacă lipsește și action este save_dossier
        if result["action"]["type"] == "save_dossier" and result["action"]["dossier"]:
            if "submitted_at" not in result["action"]["dossier"]:
                result["action"]["dossier"]["submitted_at"] = datetime.now().isoformat()
        
        return result

    except json.JSONDecodeError as e:
        return {
            "assistant_reply": f"Ne cerem scuze, dar a apărut o eroare la procesarea răspunsului: {str(e)}",
            "action": {
                "type": "ask_user_for_more_info",
                "missing_documents": [],
                "extra_documents": [],
                "dossier": None
            }
        }
    except Exception as e:
        return {
            "assistant_reply": f"Ne cerem scuze, dar a apărut o eroare tehnică: {str(e)}. Vă rugăm să încercați din nou.",
            "action": {
                "type": "ask_user_for_more_info",
                "missing_documents": [],
                "extra_documents": [],
                "dossier": None
            }
        }