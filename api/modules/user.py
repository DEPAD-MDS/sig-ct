import json
import time
import requests
from fastapi import HTTPException
from api.utils.cache import token_cache, CACHE_TIMEOUT

async def get_user_from_token(token: str) -> dict:
    """
    Service que recebe um token, valida com Microsoft Graph API 
    e retorna apenas os dados filtrados do usuário (email, displayName, id)
    """
    GRAPH_API_URL = "https://graph.microsoft.com/v1.0/me"
    
    # Verifica cache primeiro
    if token in token_cache:
        cached_data = token_cache[token]
        if time.time() - cached_data['timestamp'] < CACHE_TIMEOUT:
            # Retorna dados já filtrados do cache
            return _filter_user_data(cached_data['user_data'])
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    
    try:
        # Faz a request para Graph API
        response = requests.get(GRAPH_API_URL, headers=headers, timeout=10)
        response.raise_for_status()
        
        user_data = response.json()
        
        # Filtra os dados que queremos
        filtered_data = _filter_user_data(user_data)
        
        # Adiciona ao cache (guarda os dados completos para possível uso futuro)
        token_cache[token] = {
            'user_data': user_data,  # Dados completos
            'timestamp': time.time()
        }
        
        return filtered_data  # Retorna apenas os dados filtrados
        
    except requests.exceptions.HTTPError as http_err:
        if response.status_code == 401:
            raise HTTPException(status_code=401, detail="Token inválido ou expirado")
        elif response.status_code == 403:
            raise HTTPException(status_code=403, detail="Permissões insuficientes")
        else:
            raise HTTPException(status_code=response.status_code, detail=f"Erro na validação do token: {http_err}")
    
    except requests.exceptions.RequestException as req_err:
        raise HTTPException(status_code=500, detail=f"Erro de conexão: {req_err}")
    
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Erro ao processar resposta da API")

def _filter_user_data(user_data: dict) -> dict:
    """
    Função auxiliar para filtrar apenas os campos desejados
    """
    return {
        "email": user_data.get("mail"),
        "displayName": user_data.get("displayName"),
        "id": user_data.get("id")
    }