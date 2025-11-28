# functions/dashboard/CEBAS/cebas_routes.py
from fastapi import APIRouter, HTTPException
from functions.dashboard.CEBAS.cebas_service import CebasService
from utils.refresh_token import get_access_token_from_refresh_token

cebas_routes = APIRouter()

@cebas_routes.get("/dashboard/cebas")
def get_cebas_info(): 
    # 1. Gera token automaticamente usando o Refresh Token
    try:
        token_atual = get_access_token_from_refresh_token()
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Erro de Autenticação: {str(e)}")

    token_formatado = f"Bearer {token_atual}"
    
    # 2. Segue a vida normal
    service = CebasService(token_formatado)
    
    try:
        data = service.get_cebas_dashboard_data()
        return {
            "status": "success",
            "data": data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))