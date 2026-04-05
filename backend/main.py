from fastapi import FastAPI
from backend.routers.pyq import router as pyq_router

app = FastAPI(title="Exam Intel API")

# Register the PYQ router
app.include_router(pyq_router, prefix="/api/pyq", tags=["PYQ"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the Exam Intel API"}
