from fastapi import FastAPI
from app.services.supabase_client import supabase

app = FastAPI(title="CityFix QR")

@app.get("/")
def read_root():
    return {"message": "CityFix QR backend is running 🎉"}

@app.get("/supabase-test")
def supabase_test():
    """
    Simple endpoint to check Supabase connection.
    It reads up to 5 rows from a table named 'reports_test'.
    """
    response = supabase.table("reports_test").select("*").limit(5).execute()
    return {
        "data": response.data,
        "error": str(response.error) if response.error else None,
    }
