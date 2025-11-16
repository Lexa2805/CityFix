"""
City Hall Multi-Domain Support
Provides domain detection and extended procedures for all Timișoara City Hall services
"""

from typing import Dict, List, Optional
from pydantic import BaseModel


class ServiceDomain(BaseModel):
    """Represents a city hall service domain"""
    domain_key: str
    domain_name: str
    description: str
    keywords: List[str]
    common_questions: List[str]


class ServiceProcedure(BaseModel):
    """Represents a specific city hall procedure"""
    procedure_key: str
    procedure_name: str
    domain: str
    description: str
    required_documents: List[str]
    timeline_days: Optional[int] = None
    fees: Optional[str] = None
    location: Optional[str] = None
    contact_info: Optional[str] = None
    online_available: bool = False


# Define all 9 city hall service domains
CITY_HALL_DOMAINS: Dict[str, ServiceDomain] = {
    "urbanism": ServiceDomain(
        domain_key="urbanism",
        domain_name="Urbanism și Amenajarea Teritoriului",
        description="Certificare urbană, autorizații de construire, documentații PUZ/PUD",
        keywords=[
            "certificat urbanism", "autorizatie construire", "demolare", "puz", "pud",
            "construire", "renovare", "extindere", "urbanism", "proiect", "architectura",
            "casa", "cladire", "teren", "amenajare", "planificare urbana"
        ],
        common_questions=[
            "Cum obțin un certificat de urbanism?",
            "Ce documente îmi trebuie pentru autorizație de construire?",
            "Cât durează să obțin certificatul de urbanism?"
        ]
    ),
    "taxe_impozite": ServiceDomain(
        domain_key="taxe_impozite",
        domain_name="Taxe și Impozite Locale",
        description="Impozit pe clădiri, terenuri, vehicule, taxe locale",
        keywords=[
            "impozit", "taxa", "plata", "cladiri", "teren", "auto", "masina",
            "timbru", "amenda", "penalitati", "scutiri", "deduceri", "fiscal",
            "calcul impozit", "termen plata", "rate", "restante"
        ],
        common_questions=[
            "Cum plătesc impozitul pe clădiri?",
            "Care este termenul de plată pentru taxe?",
            "Cum calculez impozitul pe mașină?"
        ]
    ),
    "stare_civila": ServiceDomain(
        domain_key="stare_civila",
        domain_name="Stare Civilă",
        description="Certificate de naștere, căsătorie, deces, schimbare nume",
        keywords=[
            "certificat", "nastere", "casatorie", "deces", "divorț", "acte",
            "stare civila", "buletin", "nume", "schimbare", "legitimatie",
            "duplicat", "copie", "apostila", "legalizare", "traducere"
        ],
        common_questions=[
            "Ce acte îmi trebuie pentru certificat de naștere?",
            "Cum îmi schimb numele?",
            "Unde înregistrez căsătoria?"
        ]
    ),
    "asistenta_sociala": ServiceDomain(
        domain_key="asistenta_sociala",
        domain_name="Asistență Socială",
        description="Ajutor social, alocații, facilități pentru categorii vulnerabile",
        keywords=[
            "ajutor social", "alocatie", "venit minim", "asistenta", "familie",
            "copii", "handicap", "persoane varstnice", "pensie", "sprijin financiar",
            "subventie", "asistenta sociala", "servicii sociale", "cantina sociala"
        ],
        common_questions=[
            "Cum solicit ajutor social?",
            "Ce condiții trebuie să îndeplinesc pentru alocații?",
            "Unde mă pot adresa pentru asistență socială?"
        ]
    ),
    "transport": ServiceDomain(
        domain_key="transport",
        domain_name="Transport Public și Mobilitate",
        description="Abonamente STB, parcare, permise circulație",
        keywords=[
            "abonament", "stb", "transport", "tramvai", "autobuz", "parcare",
            "taxa parcare", "permis", "circulatie", "mobilitate", "traseu",
            "program", "statii", "bilet", "card", "intrare oras"
        ],
        common_questions=[
            "Cum obțin un abonament STB?",
            "Unde pot plăti taxa de parcare?",
            "Care este programul transportului public?"
        ]
    ),
    "mediu": ServiceDomain(
        domain_key="mediu",
        domain_name="Mediu și Salubritate",
        description="Gestionare deșeuri, spații verzi, poluare, ecologie",
        keywords=[
            "mediu", "salubritate", "gunoi", "deseuri", "reciclare", "colectare",
            "spatii verzi", "copaci", "poluare", "zgomot", "canalizare",
            "ecologie", "parc", "gradina", "taxa salubritate", "container"
        ],
        common_questions=[
            "Cum raportez o problemă de salubritate?",
            "Unde depun deșeurile reciclabile?",
            "Cum pot solicita plantarea unui copac?"
        ]
    ),
    "educatie": ServiceDomain(
        domain_key="educatie",
        domain_name="Educație și Învățământ",
        description="Înscrierea în școli, grădinițe, cantine, transport școlar",
        keywords=[
            "scoala", "gradinita", "inscriere", "admitere", "elev", "copil",
            "educatie", "invatamant", "cantina", "masa calda", "transport scolar",
            "burse", "rechizite", "clasa pregatitoare", "liceu", "gimnaziu"
        ],
        common_questions=[
            "Cum înscriu copilul la grădiniță?",
            "Care sunt criteriile de admitere în școli?",
            "Cum beneficiază copilul de masă caldă?"
        ]
    ),
    "cultura_sport": ServiceDomain(
        domain_key="cultura_sport",
        domain_name="Cultură și Sport",
        description="Evenimente culturale, facilități sportive, biblioteci, muzee",
        keywords=[
            "cultura", "sport", "eveniment", "spectacol", "concert", "teatru",
            "biblioteca", "muzeu", "sala", "teren sport", "bazin", "abonament sport",
            "inscriție", "activitati", "festival", "competitie", "club"
        ],
        common_questions=[
            "Ce evenimente culturale sunt organizate?",
            "Unde pot face sport în Timișoara?",
            "Cum mă înscriu la biblioteca publică?"
        ]
    ),
    "informatii_generale": ServiceDomain(
        domain_key="informatii_generale",
        domain_name="Informații Generale Primărie",
        description="Program, contact, ghișee, reclamații, sugestii",
        keywords=[
            "program", "orar", "contact", "telefon", "email", "adresa",
            "ghiseu", "informatii", "primarie", "primar", "consiliu local",
            "birouri", "departamente", "reclamatie", "sesizare", "plangere",
            "petitie", "audiente", "acces", "locatie"
        ],
        common_questions=[
            "Care este programul primăriei?",
            "Unde pot depune o reclamație?",
            "Cum contactez primăria?"
        ]
    )
}


# Extended procedures with full metadata for all domains
EXTENDED_PROCEDURES: Dict[str, ServiceProcedure] = {
    # URBANISM
    "certificat_urbanism": ServiceProcedure(
        procedure_key="certificat_urbanism",
        procedure_name="Certificat de urbanism",
        domain="urbanism",
        description="Document care confirmă regimul juridic al terenului și posibilitatea construirii",
        required_documents=[
            "Cerere tip",
            "Act de identitate",
            "Act de proprietate (carte funciară/contract)",
            "Plan de amplasament și delimitare a imobilului",
            "Dovada achitării taxei"
        ],
        timeline_days=30,
        fees="50-200 lei (funcție de tip)",
        location="Direcția Urbanism, Str. Popa Șapcă nr. 7",
        contact_info="0256-408400",
        online_available=True
    ),
    "autorizatie_construire": ServiceProcedure(
        procedure_key="autorizatie_construire",
        procedure_name="Autorizație de construire",
        domain="urbanism",
        description="Autorizație necesară pentru începerea lucrărilor de construcție",
        required_documents=[
            "Cerere tip",
            "Certificat de urbanism",
            "Documentație tehnică (proiect autorizat)",
            "Avize necesare (pompieri, sanitar, etc.)",
            "Act de proprietate",
            "Dovada achitării taxei"
        ],
        timeline_days=45,
        fees="0.5-2% din valoarea construcției",
        location="Direcția Urbanism, Str. Popa Șapcă nr. 7",
        contact_info="0256-408400",
        online_available=False
    ),
    
    # TAXE SI IMPOZITE
    "plata_impozit_cladiri": ServiceProcedure(
        procedure_key="plata_impozit_cladiri",
        procedure_name="Plata impozit pe clădiri",
        domain="taxe_impozite",
        description="Plata anuală a impozitului pentru clădirile deținute",
        required_documents=[
            "Act de identitate",
            "Act de proprietate",
            "Decizie de impunere (primită anual)"
        ],
        timeline_days=None,  # Payment anytime
        fees="Variabil (funcție de suprafață și zonă)",
        location="Direcția Taxe și Impozite, Bd. C.D. Loga nr. 1",
        contact_info="0256-408888",
        online_available=True
    ),
    "plata_taxa_auto": ServiceProcedure(
        procedure_key="plata_taxa_auto",
        procedure_name="Plata taxă auto (impozit vehicul)",
        domain="taxe_impozite",
        description="Plata anuală a impozitului pentru autovehicule",
        required_documents=[
            "Act de identitate",
            "Certificat de înmatriculare"
        ],
        timeline_days=None,
        fees="Variabil (funcție de capacitate cilindrică)",
        location="Direcția Taxe și Impozite, Bd. C.D. Loga nr. 1",
        contact_info="0256-408888",
        online_available=True
    ),
    
    # STARE CIVILA
    "certificat_nastere": ServiceProcedure(
        procedure_key="certificat_nastere",
        procedure_name="Certificat de naștere",
        domain="stare_civila",
        description="Eliberare certificat de naștere pentru nou-născut sau duplicat",
        required_documents=[
            "Cerere tip",
            "Acte de identitate părinți",
            "Certificat de căsătorie (dacă este cazul)",
            "Certificat medical constatator naștere"
        ],
        timeline_days=1,
        fees="Gratuit (prima eliberare)",
        location="Serviciul Stare Civilă, Bd. C.D. Loga nr. 1",
        contact_info="0256-408850",
        online_available=False
    ),
    "inregistrare_casatorie": ServiceProcedure(
        procedure_key="inregistrare_casatorie",
        procedure_name="Înregistrare căsătorie",
        domain="stare_civila",
        description="Căsătorie civilă la primărie",
        required_documents=[
            "Cerere de căsătorie",
            "Acte de identitate",
            "Certificate de naștere",
            "Declarații pe propria răspundere",
            "Certificate medicale premaritale"
        ],
        timeline_days=10,  # Perioada de așteptare legală
        fees="50 lei (taxă căsătorie)",
        location="Serviciul Stare Civilă, Bd. C.D. Loga nr. 1",
        contact_info="0256-408850",
        online_available=False
    ),
    
    # ASISTENTA SOCIALA
    "ajutor_social": ServiceProcedure(
        procedure_key="ajutor_social",
        procedure_name="Ajutor social (venit minim garantat)",
        domain="asistenta_sociala",
        description="Sprijin financiar pentru familii cu venituri mici",
        required_documents=[
            "Cerere tip",
            "Acte de identitate familie",
            "Declarație de venit",
            "Certificate de naștere copii",
            "Adeverință șomaj (dacă este cazul)"
        ],
        timeline_days=30,
        fees="Gratuit",
        location="Direcția Asistență Socială, Str. Mercy nr. 11",
        contact_info="0256-408700",
        online_available=False
    ),
    
    # TRANSPORT
    "abonament_transport": ServiceProcedure(
        procedure_key="abonament_transport",
        procedure_name="Abonament STB (transport public)",
        domain="transport",
        description="Abonament lunar/anual pentru transport public local",
        required_documents=[
            "Act de identitate",
            "Poză tip buletin",
            "Adeverință (pentru elevi/studenți)",
            "Certificat handicap (pentru gratuități)"
        ],
        timeline_days=1,
        fees="70 lei/lună (normal), 35 lei (elevi/studenți)",
        location="Puncte de vânzare STPT, Gara de Nord, Piața Unirii",
        contact_info="0256-493594",
        online_available=True
    ),
    
    # MEDIU
    "sesizare_salubritate": ServiceProcedure(
        procedure_key="sesizare_salubritate",
        procedure_name="Sesizare problemă salubritate",
        domain="mediu",
        description="Raportare probleme de salubritate, gunoaie neridicate, spații verzi deteriorate",
        required_documents=[
            "Descriere problemă",
            "Adresă exactă",
            "Poze (recomandate)",
            "Date de contact"
        ],
        timeline_days=7,
        fees="Gratuit",
        location="Online sau Direcția Spații Verzi, Str. Crizantemelor nr. 1",
        contact_info="0256-204700, info@retim.ro",
        online_available=True
    ),
    
    # EDUCATIE
    "inscriere_gradinita": ServiceProcedure(
        procedure_key="inscriere_gradinita",
        procedure_name="Înscriere copil la grădiniță",
        domain="educatie",
        description="Înscrierea copiilor la grădinițele publice din Timișoara",
        required_documents=[
            "Cerere de înscriere",
            "Certificat de naștere copil",
            "Acte de identitate părinți",
            "Certificat medical",
            "Fișă medicală",
            "Adeverință de la locul de muncă (pentru punctaj)"
        ],
        timeline_days=30,
        fees="Gratuit (grădiniță publică)",
        location="Grădinița dorită + Inspectoratul Școlar",
        contact_info="0256-491866 (ISJ Timiș)",
        online_available=True
    ),
    
    # CULTURA SI SPORT
    "abonament_biblioteca": ServiceProcedure(
        procedure_key="abonament_biblioteca",
        procedure_name="Abonament bibliotecă publică",
        domain="cultura_sport",
        description="Abonament pentru împrumut cărți la bibliotecile publice",
        required_documents=[
            "Act de identitate",
            "Poză",
            "Taxă abonament"
        ],
        timeline_days=1,
        fees="20 lei/an (adulți), gratuit (copii, elevi, pensionari)",
        location="Biblioteca Județeană, Bd. Eroilor de la Tisa nr. 32",
        contact_info="0256-491132",
        online_available=False
    ),
    
    # INFORMATII GENERALE
    "reclamatie_primarie": ServiceProcedure(
        procedure_key="reclamatie_primarie",
        procedure_name="Reclamație/sesizare la primărie",
        domain="informatii_generale",
        description="Depunere reclamație, petiție sau sesizare către primărie",
        required_documents=[
            "Cerere scrisă (poștă/online)",
            "Date de contact",
            "Descriere problemă",
            "Documente justificative (opțional)"
        ],
        timeline_days=30,
        fees="Gratuit",
        location="Registratură Primărie, Bd. C.D. Loga nr. 1 sau online",
        contact_info="0256-408400, relatii.cetateni@primariatm.ro",
        online_available=True
    )
}


def detect_domain_from_question(question: str) -> Optional[str]:
    """
    Detect the most likely domain based on keywords in the question.
    Returns domain_key or None if no clear match.
    """
    question_lower = question.lower()
    
    # Score each domain based on keyword matches
    domain_scores = {}
    for domain_key, domain in CITY_HALL_DOMAINS.items():
        score = 0
        for keyword in domain.keywords:
            if keyword.lower() in question_lower:
                score += 1
        domain_scores[domain_key] = score
    
    # Return domain with highest score if score > 0
    if domain_scores:
        max_domain = max(domain_scores.items(), key=lambda x: x[1])
        if max_domain[1] > 0:
            return max_domain[0]
    
    return None


def get_procedures_by_domain(domain_key: str) -> List[ServiceProcedure]:
    """Get all procedures for a specific domain"""
    return [
        proc for proc in EXTENDED_PROCEDURES.values()
        if proc.domain == domain_key
    ]


def list_all_domains() -> List[Dict]:
    """List all available domains with basic info"""
    return [
        {
            "key": domain.domain_key,
            "name": domain.domain_name,
            "description": domain.description
        }
        for domain in CITY_HALL_DOMAINS.values()
    ]


def list_all_extended_procedures() -> List[Dict]:
    """List all procedures from all domains with complete information"""
    return [
        {
            "key": proc.procedure_key,
            "name": proc.procedure_name,
            "domain": proc.domain,
            "description": proc.description,
            "required_documents": proc.required_documents,
            "timeline_days": proc.timeline_days,
            "fees": proc.fees,
            "location": proc.location,
            "contact_info": proc.contact_info,
            "online_available": proc.online_available
        }
        for proc in EXTENDED_PROCEDURES.values()
    ]
