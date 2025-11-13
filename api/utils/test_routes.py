from fastapi import APIRouter

test_routes = APIRouter()

@test_routes.get("/")
async def root():
    return {"status": "ok", "working": True, "message": "Rota publica funcionando"}

@test_routes.get("/test")
async def test_route():
    return {"status": "ok", "working": True, "message": "Rota privada funcionando"}
