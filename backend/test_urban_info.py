"""
Test pentru sistemul de ghidare extras de informare urbanistică
"""

from app.services.urban_info_helper import (
    detect_urban_info_request,
    get_urban_info_instructions,
    extract_address_from_text,
    get_troubleshooting_tips
)

def test_detection():
    """Testează detectarea cererii de extras urbanistic"""
    print("=" * 60)
    print("TEST 1: Detectare cerere extras urbanistic")
    print("=" * 60)
    
    test_questions = [
        "Am nevoie de un extras de informare urbanistica",
        "Vreau sa descarc extras de informare urbanism",
        "Cum obtin certificat de informare urbanistica?",
        "Ma ajuti cu extras harta primariatm?",
        "Vreau sa construiesc o casa"  # Should NOT detect
    ]
    
    for question in test_questions:
        detected = detect_urban_info_request(question)
        print(f"\n'{question}'")
        print(f"  → Detectat: {'✅ DA' if detected else '❌ NU'}")


def test_address_extraction():
    """Testează extragerea adresei din text"""
    print("\n" + "=" * 60)
    print("TEST 2: Extragere adresă")
    print("=" * 60)
    
    test_texts = [
        "Am nevoie de extras pentru Strada Revolutiei, nr. 10",
        "Locuiesc pe str. Eroilor nr. 25A",
        "Proprietatea mea este pe bd. Republicii nr. 100",
        "Calea Aradului nr. 5",
        "Am o casa in Timisoara"  # Should NOT extract
    ]
    
    for text in test_texts:
        address = extract_address_from_text(text)
        print(f"\n'{text}'")
        print(f"  → Adresă: {address if address else '❌ Nu s-a găsit'}")


def test_instructions_without_address():
    """Testează generarea instrucțiunilor fără adresă"""
    print("\n" + "=" * 60)
    print("TEST 3: Instrucțiuni FĂRĂ adresă")
    print("=" * 60)
    
    result = get_urban_info_instructions()
    print(f"\nNevoie de adresă: {result['needs_address']}")
    print(f"\nMesaj:\n{result['message']}")


def test_instructions_with_address():
    """Testează generarea instrucțiunilor CU adresă"""
    print("\n" + "=" * 60)
    print("TEST 4: Instrucțiuni CU adresă")
    print("=" * 60)
    
    result = get_urban_info_instructions("Strada Revolutiei, nr. 10")
    print(f"\nNevoie de adresă: {result['needs_address']}")
    print(f"URL Portal: {result['portal_url']}")
    print(f"\nPași ({len(result['steps'])}):")
    for i, step in enumerate(result['steps'], 1):
        print(f"  {step}")
    print(f"\n{'='*60}")
    print("Mesaj complet:")
    print(f"{'='*60}")
    print(result['message'])


def test_troubleshooting():
    """Testează sfaturile de depanare"""
    print("\n" + "=" * 60)
    print("TEST 5: Sfaturi depanare")
    print("=" * 60)
    
    tips = get_troubleshooting_tips()
    print(tips)


if __name__ == "__main__":
    print("\n🧪 TESTARE SISTEM GHIDARE EXTRAS URBANISTIC\n")
    
    test_detection()
    test_address_extraction()
    test_instructions_without_address()
    test_instructions_with_address()
    test_troubleshooting()
    
    print("\n" + "=" * 60)
    print("✅ TESTE COMPLETATE!")
    print("=" * 60)
