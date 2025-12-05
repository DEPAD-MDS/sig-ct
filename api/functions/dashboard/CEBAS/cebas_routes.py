# functions/dashboard/CEBAS/cebas_routes.py
from fastapi import APIRouter, HTTPException
from functions.dashboard.CEBAS.cebas_service import CebasService
# Importe o tipo que criamos acima (opcional, mas recomendado)
# from functions.dashboard.CEBAS.cebas_types import CebasResponse 
from utils.refresh_token import get_access_token_from_refresh_token

cebas_routes = APIRouter()

@cebas_routes.get("/dashboard/cebas") # response_model=CebasResponse (adicione se criou o arquivo types)
def get_cebas_info(): 
    # ... (código de autenticação que você já tem) ...
    try:
        token_atual = get_access_token_from_refresh_token()
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Erro de Autenticação: {str(e)}")

    token_formatado = f"Bearer {token_atual}"
    
    service = CebasService(token_formatado)
    
    try:
        # Agora o data virá limpo e organizado
        data = service.get_cebas_dashboard_data()
        
        return {
            "status": "success",
            "data": data
        }
    except Exception as e:
        # Dica: Printar o erro no console ajuda a debugar no servidor
        print(f"Erro no CEBAS Service: {e}") 
        raise HTTPException(status_code=500, detail=str(e))