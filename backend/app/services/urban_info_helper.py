"""
Urban Information Helper - Ghid pentru descărcarea extraselor de informare urbanistică
========================================================================================

Acest modul ajută cetățenii să obțină extrase de informare urbanistică de pe
portalul oficial al Primăriei Timișoara folosind coduri cadastrale.
"""
import re
from typing import Optional


def get_urban_info_instructions(cadastral_code: Optional[str] = None, address: Optional[str] = None) -> dict:
    """
    Generează instrucțiuni pentru descărcarea extrasului de informare urbanistică.
    Poate folosi fie codul cadastral direct, fie adresa pentru a găsi codul.
    
    Args:
        cadastral_code: Codul cadastral al parcelei (6 cifre) - prioritate
        address: Adresa imobilului - folosit dacă nu există cod cadastral
    
    Returns:
        dict: {
            "message": str,
            "portal_url": str,
            "steps": list[str],
            "needs_cadastral_code": bool,
            "cadastral_code": str|None,
            "address": str|None
        }
    """
    portal_url = "https://harta.primariatm.ro/"
    
    # Dacă avem cod cadastral, folosim instrucțiunile directe
    if cadastral_code:
        steps = [
            f"Accesați portalul oficial: {portal_url}",
            f"În bara de căutare 'Caută în straturi vizibile...', introduceți codul: {cadastral_code}",
            "Apăsați Enter sau click pe butonul de căutare (lupă)",
            "Harta se va centra automat pe parcela cu codul respectiv",
            "Click pe parcela evidențiată (va apărea un marcator roșu)",
            "În fereastra popup, veți vedea butonul 'Descarcă extras de informare'",
            "Click pe buton pentru a descărca documentul PDF",
            "Salvați documentul și încărcați-l aici pentru validare"
        ]
        
        message = f"""📋 **Extras de Informare Urbanistică - Cod Cadastral: {cadastral_code}**

Vă ghidez pas cu pas pentru descărcarea extrasului de pe portalul oficial al Primăriei Timișoara.

**Pași de urmat:**

"""
        
        for i, step in enumerate(steps, 1):
            message += f"{i}. {step}\n"
        
        message += "\n💡 **Important:** Codul cadastral este numărul de 6 cifre vizibil pe parcele în hartă."
        message += "\n\n❓ **Probleme?** Dacă nu găsiți codul sau harta nu se încarcă, vă pot ajuta cu soluții alternative."
        
        return {
            "message": message,
            "portal_url": portal_url,
            "steps": steps,
            "needs_cadastral_code": False,
            "cadastral_code": cadastral_code,
            "address": None
        }
    
    # Dacă avem adresă, dăm instrucțiuni să găsească codul pe hartă
    if address:
        steps = [
            f"Accesați portalul oficial: {portal_url}",
            f"În bara de căutare, introduceți adresa: {address}",
            "Harta va afișa locația - veți vedea parcela evidențiată",
            "Pe parcelă este afișat un număr de 6 cifre - acesta este codul cadastral",
            "Notați codul cadastral (ex: 407839) pentru referință viitoare",
            "Click pe parcelă pentru a vedea butonul 'Descarcă extras de informare'",
            "Click pe buton pentru a descărca documentul PDF",
            "Salvați documentul și încărcați-l aici pentru validare"
        ]
        
        message = f"""📋 **Extras de Informare Urbanistică pentru: {address}**

Vă ghidez pas cu pas pentru a găsi codul cadastral și a descărca extrasul.

**Pași de urmat:**

"""
        
        for i, step in enumerate(steps, 1):
            message += f"{i}. {step}\n"
        
        message += f"\n💡 **Sfat:** După ce găsiți parcela pentru {address}, veți vedea codul cadastral (6 cifre) direct pe hartă."
        message += "\n\n✅ **Simplificare:** Nu trebuie să-mi comunicați codul - doar urmați pașii și descărcați documentul!"
        message += "\n\n❓ **Probleme?** Dacă nu găsiți adresa sau harta nu se încarcă, vă pot ajuta cu soluții alternative."
        
        return {
            "message": message,
            "portal_url": portal_url,
            "steps": steps,
            "needs_cadastral_code": False,
            "address": address,
            "cadastral_code": None
        }
    
    # Dacă nu avem nici cod, nici adresă
    return {
        "message": """Pentru a descărca extrasul de informare urbanistică, am nevoie de una din următoarele:

**Opțiunea 1 - Codul cadastral** (mai rapid):
- Un număr de 6 cifre (ex: 407839, 406635)
- Îl puteți găsi pe parcela dumneavoastră pe harta.primariatm.ro

**Opțiunea 2 - Adresa completă**:
- Strada și numărul (ex: "Strada Eroilor, nr. 25")
- Vă voi ghida să găsiți codul cadastral pe hartă

Vă rog să-mi furnizați fie codul cadastral, fie adresa completă.""",
        "portal_url": portal_url,
        "steps": [],
        "needs_cadastral_code": True,
        "cadastral_code": None,
        "address": None
    }


def detect_urban_info_request(question: str) -> bool:
    """
    Detectează dacă utilizatorul solicită un extras de informare urbanistică.
    
    Args:
        question: Întrebarea utilizatorului
    
    Returns:
        bool: True dacă se solicită extras de informare urbanistică
    """
    keywords = [
        "extras de informare",
        "extras informare urbanistica",
        "extras informare urbanism",
        "informare urbanistica",
        "informare urbanism",
        "extras urbanistic",
        "extras pentru",
        "certificat informare",
        "harta.primariatm",
        "extras harta",
        "cod cadastral",
        "numar cadastral"
    ]
    
    question_lower = question.lower()
    return any(keyword in question_lower for keyword in keywords)


def extract_cadastral_code_from_text(text: str) -> Optional[str]:
    """
    Extrage codul cadastral (6 cifre) dintr-un text.
    
    Args:
        text: Textul din care să se extragă codul cadastral
    
    Returns:
        str: Codul cadastral extras sau None
    """
    # Pattern-uri pentru coduri cadastrale: 6 cifre
    patterns = [
        r'cod(?:ul)?\s*cadastral[:\s]*(\d{6})',
        r'num[ăa]r(?:ul)?\s*cadastral[:\s]*(\d{6})',
        r'cadastral[:\s]*(\d{6})',
        r'\b(\d{6})\b'  # Orice secvență de exact 6 cifre
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1)
    
    return None


def extract_address_from_text(text: str) -> Optional[str]:
    """
    Extrage adresa dintr-un text (pentru a găsi codul cadastral pe hartă).
    
    Args:
        text: Textul din care să se extragă adresa
    
    Returns:
        str: Adresa extrasă sau None
    """
    # Pattern-uri pentru adrese românești
    patterns = [
        r'(?:str(?:ada)?\.?\s+)([^,\n]+?)(?:\s*,?\s*nr\.?\s*(\d+[a-zA-Z]*))',
        r'(?:bd\.?\s+|bulevardul\s+)([^,\n]+?)(?:\s*,?\s*nr\.?\s*(\d+[a-zA-Z]*))',
        r'(?:calea\s+)([^,\n]+?)(?:\s*,?\s*nr\.?\s*(\d+[a-zA-Z]*))',
        r'(?:piața\s+|piata\s+)([^,\n]+?)(?:\s*,?\s*nr\.?\s*(\d+[a-zA-Z]*))',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            street = match.group(1).strip()
            number = match.group(2).strip() if len(match.groups()) > 1 else ""
            if number:
                return f"{street}, nr. {number}"
            return street
    
    return None


def get_urban_info_instructions_with_address(address: str) -> dict:
    """
    Generează instrucțiuni pentru a găsi codul cadastral folosind adresa.
    
    Args:
        address: Adresa imobilului
    
    Returns:
        dict cu instrucțiuni pentru găsirea codului cadastral
    """
    portal_url = "https://harta.primariatm.ro/"
    
    steps = [
        f"Accesați portalul oficial: {portal_url}",
        f"În bara de căutare, introduceți adresa: {address}",
        "Harta va afișa locația - veți vedea parcela evidențiată",
        "Pe parcelă este afișat un număr de 6 cifre - acesta este codul cadastral",
        "Notați codul cadastral (ex: 407839)",
        "Click pe parcelă pentru a confirma și a vedea butonul 'Descarcă extras de informare'",
        "Click pe buton pentru a descărca documentul PDF",
        "Salvați documentul și încărcați-l aici pentru validare"
    ]
    
    message = f"""📋 **Extras de Informare Urbanistică pentru: {address}**

Vă ghidez pas cu pas pentru a găsi codul cadastral și a descărca extrasul.

**Pași de urmat:**

"""
    
    for i, step in enumerate(steps, 1):
        message += f"{i}. {step}\n"
    
    message += f"\n💡 **Sfat:** După ce găsiți parcela pentru {address}, veți vedea codul cadastral (6 cifre) direct pe hartă."
    message += "\n\n✅ **Simplificare:** Nu trebuie să-mi spuneți codul - doar urmați pașii și descărcați documentul!"
    message += "\n\n❓ **Probleme?** Dacă nu găsiți adresa sau harta nu se încarcă, vă pot ajuta cu soluții alternative."
    
    return {
        "message": message,
        "portal_url": portal_url,
        "steps": steps,
        "needs_cadastral_code": False,
        "address": address,
        "cadastral_code": None
    }


def get_upload_confirmation_message(cadastral_code: str) -> str:
    """
    Returnează mesajul de confirmare după încărcarea documentului.
    
    Args:
        cadastral_code: Codul cadastral pentru care s-a descărcat extrasul
    
    Returns:
        str: Mesaj de confirmare
    """
    return f"""✅ **Document încărcat cu succes!**

Am primit extrasul de informare urbanistică pentru codul cadastral: {cadastral_code}

Voi analiza documentul și vă voi informa dacă sunt necesare documente suplimentare pentru procedura dumneavoastră.

📋 **Următorii pași:**
1. Verificare conformitate document
2. Identificare cerințe suplimentare
3. Ghidare pentru completarea dosarului

Vă mulțumesc pentru colaborare! 🏗️"""


def get_troubleshooting_tips() -> str:
    """
    Returnează sfaturi pentru rezolvarea problemelor comune.
    
    Returns:
        str: Sfaturi de depanare
    """
    return """🔧 **Rezolvare probleme comune:**

**Harta nu se încarcă:**
- Verificați conexiunea la internet
- Reîmprospătați pagina (F5)
- Folosiți un browser modern (Chrome/Firefox/Edge)
- Dezactivați temporar AdBlock sau extensiile

**Nu găsesc codul cadastral:**
- Codurile sunt numerele de 6 cifre vizibile pe parcele (ex: 407839)
- Zoom in pe hartă pentru a vedea mai clar numerele
- Click pe parcelă - codul apare în fereastra popup
- Dacă nu știți codul, căutați mai întâi după adresa străzii

**Căutarea nu funcționează:**
- Introduceți exact cele 6 cifre în bara de căutare
- Nu adăugați spații sau caractere suplimentare
- Asigurați-vă că folosiți bara 'Caută în straturi vizibile...' din stânga sus

**Butonul de descărcare nu apare:**
- Verificați dacă ați dat click pe parcela corectă
- Browser-ul poate bloca pop-up-uri - verificați setările
- Încercați click dreapta → "Salvează ca..." dacă PDF-ul se deschide direct

**Aveți probleme în continuare?**
Contactați Primăria Timișoara:
- ☎️ Telefon: 0256 408 300
- 📧 Email: primarie@primariatm.ro
- 🕐 Program: Luni-Vineri, 8:00-16:30

Sau vizitați sediul cu un stick USB pentru a obține documentul direct."""
