from fastapi import FastAPI
from middleware.middleware import auth_middleware
from routes.routes import router

app = FastAPI(title="Microsoft Auth API", version="1.0.0")

# Adicionar middleware
app.middleware("http")(auth_middleware)

# Registrar rotas
app.include_router(router, prefix="/v1")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)