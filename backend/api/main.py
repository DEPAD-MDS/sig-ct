from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from middleware.auth_middleware import auth_middleware
from router import router  # importa apenas uma vez


app = FastAPI(title="Microsoft Auth API", version="1.0.0")

# CORS simplificado
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
app.middleware("http")(auth_middleware)
app.include_router(router, prefix="/api/v1")