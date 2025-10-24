from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def root():
    return {"status": "ok", "working": True, "message": "Rota publica funcionando"}

@router.get("/test")
async def test_route():
    return {"status": "ok", "working": True, "message": "Rota privada funcionando"}