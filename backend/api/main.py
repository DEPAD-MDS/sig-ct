from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from router import router 


app = FastAPI(title="Microsoft Auth API", version="1.0.0")

# CORS simplificado
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(router, prefix="/api/v1")

# A verificação de erros utiliza dos recursos de try/except. É recomendado a
# troca de funções comuns para funções ascicronas. TODO - Adicionar middle -
# ware na main.