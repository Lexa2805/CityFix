from fastapi import FastAPI

app = FastAPI(title="CityFix QR")

@app.get("/")
def read_root():
    return {"message": "CityFix QR backend is running 🎉"}
