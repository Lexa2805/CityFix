"""
Test pentru sistemul de extras urbanistic cu coduri cadastrale
"""
from app.services.urban_info_helper import (
    detect_urban_info_request,
    extract_cadastral_code_from_text,
    get_urban_info_instructions,
    get_troubleshooting_tips
)

def test_detection():
    """Test detectare cerere extras urbanistic"""
    print("\n" + "="*60)
    print("TEST 1: Detectare cerere extras urbanistic")
    print("="*60)
    
    test_cases = [
        "Am nevoie de un extras de informare urbanistica",
        "Vreau extras de informare pentru codul cadastral 407839",
        "Cum obtin certificat de informare urbanistica?",
        "Ma ajuti cu extras harta primariatm?",
        "Cod cadastral 406635",
        "Vreau sa construiesc o casa"  # Trebuie să fie False
    ]
    
    for question in test_cases:
        result = detect_urban_info_request(question)
        status = "✅ DA" if result else "❌ NU"
        print(f"\n'{question}'")
        print(f"  → Detectat: {status}")


def test_cadastral_code_extraction():
    """Test extragere cod cadastral"""
    print("\n" + "="*60)
    print("TEST 2: Extragere cod cadastral")
    print("="*60)
    
    test_cases = [
        "Am nevoie de extras pentru codul cadastral 407839",
        "Cod cadastral: 406635",
        "Numar cadastral 404396",
        "Parcela mea este 420794",
        "Vreau extras pentru 457474",
        "Am o casa in Timisoara"  # Nu ar trebui să găsească
    ]
    
    for text in test_cases:
        code = extract_cadastral_code_from_text(text)
        if code:
            print(f"\n'{text}'")
            print(f"  → Cod: {code}")
        else:
            print(f"\n'{text}'")
            print(f"  → Cod: ❌ Nu s-a găsit")


def test_instructions_without_code():
    """Test instrucțiuni FĂRĂ cod cadastral"""
    print("\n" + "="*60)
    print("TEST 3: Instrucțiuni FĂRĂ cod cadastral")
    print("="*60)
    
    instructions = get_urban_info_instructions()
    
    print(f"\nNevoie de cod: {instructions['needs_cadastral_code']}")
    print(f"\nMesaj:")
    print(instructions['message'])


def test_instructions_with_code():
    """Test instrucțiuni CU cod cadastral"""
    print("\n" + "="*60)
    print("TEST 4: Instrucțiuni CU cod cadastral")
    print("="*60)
    
    cadastral_code = "407839"
    instructions = get_urban_info_instructions(cadastral_code)
    
    print(f"\nNevoie de cod: {instructions['needs_cadastral_code']}")
    print(f"Cod cadastral: {instructions['cadastral_code']}")
    print(f"URL Portal: {instructions['portal_url']}")
    print(f"\nPași ({len(instructions['steps'])}):")
    for i, step in enumerate(instructions['steps'], 1):
        print(f"  {i}. {step}")
    
    print("\n" + "="*60)
    print("Mesaj complet:")
    print("="*60)
    print(instructions['message'])


def test_troubleshooting():
    """Test sfaturi depanare"""
    print("\n" + "="*60)
    print("TEST 5: Sfaturi depanare pentru coduri cadastrale")
    print("="*60)
    print(get_troubleshooting_tips())


if __name__ == "__main__":
    print("\n🧪 TESTARE SISTEM COD CADASTRAL\n")
    
    test_detection()
    test_cadastral_code_extraction()
    test_instructions_without_code()
    test_instructions_with_code()
    test_troubleshooting()
    
    print("\n" + "="*60)
    print("✅ TESTE COMPLETATE!")
    print("="*60)
