from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.health import router as health_router

app = FastAPI(
    title="Petorium Vet Clinic API",
    version="1.0.0"
)

# CHO PHÉP FRONTEND GỌI API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # tạm thời cho tất cả
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
