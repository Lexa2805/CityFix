"""
Test pentru sistemul de extras urbanistic cu suport pentru adrese
"""
from app.services.urban_info_helper import (
    detect_urban_info_request,
    extract_cadastral_code_from_text,
    extract_address_from_text,
    get_urban_info_instructions,
    get_troubleshooting_tips
)

def test_address_extraction():
    """Test extragere adresă"""
    print("\n" + "="*60)
    print("TEST 1: Extragere adresă din text")
    print("="*60)
    
    test_cases = [
        "Am nevoie de extras pentru Strada Revolutiei, nr. 10",
        "Locuiesc pe str. Eroilor nr. 25A",
        "Proprietatea mea este pe bd. Republicii nr. 100",
        "Calea Aradului nr. 5",
        "Extras pentru Piața Victoriei nr. 2",
        "Am o casa in Timisoara"  # Nu ar trebui să găsească
    ]
    
    for text in test_cases:
        address = extract_address_from_text(text)
        if address:
            print(f"\n'{text}'")
            print(f"  → Adresă: {address}")
        else:
            print(f"\n'{text}'")
            print(f"  → Adresă: ❌ Nu s-a găsit")


def test_with_cadastral_code():
    """Test instrucțiuni CU cod cadastral"""
    print("\n" + "="*60)
    print("TEST 2: Instrucțiuni CU cod cadastral")
    print("="*60)
    
    cadastral_code = "407839"
    instructions = get_urban_info_instructions(cadastral_code=cadastral_code)
    
    print(f"\nNevoie de cod: {instructions['needs_cadastral_code']}")
    print(f"Cod cadastral: {instructions['cadastral_code']}")
    print(f"Adresă: {instructions.get('address', 'N/A')}")
    print(f"\nPași ({len(instructions['steps'])}):")
    for i, step in enumerate(instructions['steps'], 1):
        print(f"  {i}. {step}")


def test_with_address():
    """Test instrucțiuni CU adresă (fără cod cadastral)"""
    print("\n" + "="*60)
    print("TEST 3: Instrucțiuni CU adresă (FĂRĂ cod)")
    print("="*60)
    
    address = "Strada Eroilor, nr. 25"
    instructions = get_urban_info_instructions(address=address)
    
    print(f"\nNevoie de cod: {instructions['needs_cadastral_code']}")
    print(f"Cod cadastral: {instructions.get('cadastral_code', 'N/A')}")
    print(f"Adresă: {instructions.get('address')}")
    print(f"\nPași ({len(instructions['steps'])}):")
    for i, step in enumerate(instructions['steps'], 1):
        print(f"  {i}. {step}")
    
    print("\n" + "="*60)
    print("Mesaj complet:")
    print("="*60)
    print(instructions['message'])


def test_without_code_or_address():
    """Test instrucțiuni FĂRĂ cod ȘI fără adresă"""
    print("\n" + "="*60)
    print("TEST 4: Instrucțiuni FĂRĂ cod ȘI FĂRĂ adresă")
    print("="*60)
    
    instructions = get_urban_info_instructions()
    
    print(f"\nNevoie de cod: {instructions['needs_cadastral_code']}")
    print(f"\nMesaj:")
    print(instructions['message'])


def test_full_workflow():
    """Test workflow complet - din întrebare în instrucțiuni"""
    print("\n" + "="*60)
    print("TEST 5: Workflow complet (din întrebare)")
    print("="*60)
    
    questions = [
        "Am nevoie de extras de informare pentru Strada Revolutiei nr. 10",
        "Vreau extras pentru codul cadastral 407839",
        "Extras informare urbanistica bd. Republicii nr. 50",
        "Am nevoie de extras de informare urbanistica"  # Fără detalii
    ]
    
    for question in questions:
        print(f"\n📝 Întrebare: '{question}'")
        
        # Detectăm cererea
        is_urban = detect_urban_info_request(question)
        print(f"   Detectat cerere urbanism: {'✅' if is_urban else '❌'}")
        
        if not is_urban:
            continue
        
        # Extragem codul cadastral (prioritate)
        cadastral_code = extract_cadastral_code_from_text(question)
        print(f"   Cod cadastral extras: {cadastral_code if cadastral_code else '❌'}")
        
        # Dacă nu avem cod, extragem adresa
        address = None
        if not cadastral_code:
            address = extract_address_from_text(question)
            print(f"   Adresă extrasă: {address if address else '❌'}")
        
        # Generăm instrucțiunile
        instructions = get_urban_info_instructions(cadastral_code, address)
        print(f"   Are nevoie de mai multe info: {'DA' if instructions['needs_cadastral_code'] else 'NU'}")
        print(f"   Număr pași: {len(instructions['steps'])}")


if __name__ == "__main__":
    print("\n🧪 TESTARE SISTEM URBAN INFO CU SUPORT ADRESE\n")
    
    test_address_extraction()
    test_with_cadastral_code()
    test_with_address()
    test_without_code_or_address()
    test_full_workflow()
    
    print("\n" + "="*60)
    print("✅ TESTE COMPLETATE!")
    print("="*60)
