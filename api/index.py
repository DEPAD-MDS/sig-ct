from fastapi import FastAPI

from api.middleware.middleware import auth_middleware
from api.routes import router

app = FastAPI(title="Microsoft Auth API", version="1.0.0")
app.middleware("http")(auth_middleware)
app.include_router(router)


@app.get("/api")
@app.get("/api/")
async def root():
    return {"message": "Hello from Vercel! 🚀"}

@app.get("/api/test")
async def test():
    return {"status": "ok", "working": True}