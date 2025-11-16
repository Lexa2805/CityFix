"""
DEMONSTRAȚIE: Sistem Urban Info cu Suport pentru Adrese
========================================================

Acest sistem permite cetățenilor să obțină extras de informare urbanistică
furnizând DOAR ADRESA - nu mai este necesar codul cadastral!
"""

from app.services.urban_info_helper import (
    detect_urban_info_request,
    extract_cadastral_code_from_text,
    extract_address_from_text,
    get_urban_info_instructions
)

def demo_scenario(question: str):
    """Simulează întregul workflow pentru o întrebare"""
    print(f"\n{'='*70}")
    print(f"👤 Cetățean: '{question}'")
    print('='*70)
    
    # 1. Detectăm cererea
    is_urban = detect_urban_info_request(question)
    if not is_urban:
        print("❌ Nu este o cerere pentru extras urbanistic")
        return
    
    print("✅ Detectat: Cerere pentru extras de informare urbanistică")
    
    # 2. Încercăm să extragem codul cadastral (prioritate)
    cadastral_code = extract_cadastral_code_from_text(question)
    if cadastral_code:
        print(f"🔢 Cod cadastral identificat: {cadastral_code}")
    
    # 3. Dacă nu avem cod, extragem adresa
    address = None
    if not cadastral_code:
        address = extract_address_from_text(question)
        if address:
            print(f"📍 Adresă identificată: {address}")
    
    # 4. Generăm instrucțiunile
    instructions = get_urban_info_instructions(cadastral_code, address)
    
    print(f"\n{'─'*70}")
    print("🤖 RĂSPUNS AI:")
    print('─'*70)
    print(instructions['message'])
    print('─'*70)
    
    if instructions['needs_cadastral_code']:
        print("\n⚠️  AI-ul așteaptă mai multe informații de la utilizator")
    else:
        print("\n✅ AI-ul a furnizat instrucțiuni complete!")


if __name__ == "__main__":
    print("""
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║  🏗️  SISTEM URBAN INFO - DEMONSTRAȚIE FUNCȚIONALITATE            ║
║                                                                   ║
║  Cetățeanul poate furniza:                                        ║
║  • Adresa completă (ex: "Strada Eroilor nr. 25")                  ║
║  • Cod cadastral (ex: "407839")                                   ║
║  • Ambele                                                         ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
    """)
    
    # Scenario 1: Cetățean furnizează doar adresa
    demo_scenario("Am nevoie de extras de informare pentru Strada Revolutiei nr. 10")
    
    input("\n\n[Apasă ENTER pentru următorul scenariu...]")
    
    # Scenario 2: Cetățean furnizează cod cadastral
    demo_scenario("Vreau extras pentru codul cadastral 407839")
    
    input("\n\n[Apasă ENTER pentru următorul scenariu...]")
    
    # Scenario 3: Cetățean nu furnizează nimic
    demo_scenario("Am nevoie de extras de informare urbanistica")
    
    input("\n\n[Apasă ENTER pentru următorul scenariu...]")
    
    # Scenario 4: Cetățean folosește adresă cu bulevardul
    demo_scenario("Extras informare urbanistica bd. Republicii nr. 50")
    
    print(f"\n{'='*70}")
    print("✅ DEMONSTRAȚIE COMPLETATĂ!")
    print('='*70)
    print("""
AVANTAJE:
✓ Cetățeanul poate furniza doar adresa - NU mai trebuie să caute codul!
✓ Sistemul ghidează pas cu pas pentru găsirea codului pe hartă
✓ Instrucțiuni personalizate pentru fiecare situație
✓ Suport pentru toate tipurile de adrese (Strada, Bd., Calea, Piața)
    """)
