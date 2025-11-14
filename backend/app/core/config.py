# backend/app/core/config.py
import os
from dotenv import load_dotenv

# Load variables from .env at project root (backend/.env)
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    # This helps us see the problem early in logs
    raise RuntimeError("Supabase env vars are missing. Check backend/.env")
