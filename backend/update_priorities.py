import os
from datetime import datetime
from app.services.supabase_client import supabase  # Clientul tău Supabase
from app.services.prioritization import Application, prioritize_applications # Logica ta de prioritizare
from app.core.config import SUPABASE_URL # Asigură-te că .env e încărcat

def _parse_iso(dt_str: str) -> datetime:
    if dt_str is None:
        return None
    return datetime.fromisoformat(dt_str.replace("Z", "+00:00"))

def run_priority_update():
    print("Încep actualizarea priorităților...")
    
    try:
        # 1. Preia toate cererile active (nefinalizate)
        res = supabase.table("requests").select("*").in_("status", ["pending_validation", "in_review"]).execute()
        
        if not res.data:
            print("Nu există cereri active de prioritizat.")
            return

        print(f"Am găsit {len(res.data)} cereri active.")
        
        # 2. Mapează datele la obiectele 'Application'
        apps: list[Application] = []
        for r in res.data:
            submitted_at = _parse_iso(r["created_at"]) # Folosim created_at sau submitted_at
            legal_due = _parse_iso(r["legal_deadline"]) if r.get("legal_deadline") else None
            
            apps.append(
                Application(
                    id=str(r["id"]),
                    flow_type=r.get("request_type", "altele"),
                    submitted_at=submitted_at,
                    legal_due_date=legal_due,
                    status=r.get("status", "pending_validation"),
                )
            )

        # 3. Calculează prioritățile folosind logica ta existentă
        prioritized_list = prioritize_applications(apps)
        
        # 4. Pregătește datele pentru actualizare
        updates = []
        for item in prioritized_list:
            updates.append({
                "id": item["id"],
                "priority": item["priority_score"] # Salvează scorul în coloana 'priority'
            })
            
        if not updates:
            print("Nicio actualizare de prioritate necesară.")
            return

        # 5. Actualizează toate cererile în Supabase
        print(f"Actualizez {len(updates)} cereri...")
        supabase.table("requests").upsert(updates).execute()
        
        print("✅ Actualizarea priorităților a fost finalizată cu succes!")

    except Exception as e:
        print(f"❌ Eroare la actualizarea priorităților: {e}")

if __name__ == "__main__":
    run_priority_update()