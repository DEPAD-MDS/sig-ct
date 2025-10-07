from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.middleware.middleware import auth_middleware
from api.routes import router

app = FastAPI(title="Microsoft Auth API", version="1.0.0")

# REMOVE o primeiro CORS e deixa só esse:
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
"*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=[
       "*"
    ],
)

# O resto continua igual
app.middleware("http")(auth_middleware)
app.include_router(router, prefix="/api")

@app.get("/api")
@app.get("/api/")
async def root():
    return {"message": "Hello from Vercel! 🚀"}

@app.get("/api/test")
async def test():
    return {"status": "ok", "working": True}