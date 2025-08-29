import json
import time
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
import requests
from utils.cache import token_cache, CACHE_TIMEOUT

async def validate_microsoft_token(token: str) -> dict:
    GRAPH_API_URL = "https://graph.microsoft.com/v1.0/me"

    """
    Valida o token com a Microsoft Graph API e retorna os dados do usuário
    """
    # Verifica se o token está no cache
    if token in token_cache:
        cached_data = token_cache[token]
        if time.time() - cached_data['timestamp'] < CACHE_TIMEOUT:
            return cached_data['user_data']
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    
    try:
        response = requests.get(GRAPH_API_URL, headers=headers, timeout=10)
        response.raise_for_status()
        
        user_data = response.json()
        
        # Adiciona ao cache
        token_cache[token] = {
            'user_data': user_data,
            'timestamp': time.time()
        }
        
        return user_data
        
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


async def auth_middleware(request: Request, call_next):
    """
    Middleware que valida o token de autorização com Microsoft Graph API
    """
    # Rotas públicas que não requerem autenticação
    public_routes = ["/api/v1/public"]
    
    if any(request.url.path.startswith(route) for route in public_routes):
        return await call_next(request)
    
    # Verifica se o header Authorization existe
    auth_header = request.headers.get("Authorization")
    
    if not auth_header:
        return JSONResponse(
            status_code=401,
            content={"message": "Header Authorization é obrigatório"}
        )
    
    # Verifica se o header está no formato correto
    if not auth_header.startswith("Bearer "):
        return JSONResponse(
            status_code=401,
            content={"message": "Formato inválido. Use: Bearer <token>"}
        )
    
    # Extrai o token
    token = auth_header.replace("Bearer ", "").strip()
    
    if not token:
        return JSONResponse(
            status_code=401,
            content={"message": "Token não fornecido"}
        )
    
    try:
        # Valida o token com a Microsoft Graph API
        user_data = await validate_microsoft_token(token)
        
        # Adiciona os dados do usuário ao request state para uso nas rotas
        request.state.user = user_data
        request.state.token = token
        
        # Continua com a requisição
        response = await call_next(request)
        return response
        
    except HTTPException as he:
        return JSONResponse(
            status_code=he.status_code,
            content={"message": he.detail}
        )
    
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"message": f"Erro interno: {str(e)}"}
        )