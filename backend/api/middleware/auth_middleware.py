from fastapi import Request
from fastapi.responses import JSONResponse
from core.codes import APIError, create_http_exception
import httpx

async def auth_middleware(request: Request, call_next):
    
    # Skip para rotas públicas
    public_routes = ["/api/v1/", "/openapi.json", "/docs", "/redoc", "/health"]
    if request.url.path in public_routes:
        return await call_next(request)
    
    token_header = request.headers.get("Authorization")    
    
    # 1. Verifica se header existe
    if not token_header:
        return JSONResponse(
            status_code=APIError.UNAUTHORIZED["status_code"],
            content={
                "code": APIError.UNAUTHORIZED["code"],
                "message": "Header Authorization é obrigatório."
            }
        )
    
    if not token_header.startswith("Bearer "):
        return JSONResponse(
            status_code=APIError.UNAUTHORIZED["status_code"],
            content={
                "code": APIError.UNAUTHORIZED["code"],
                "message": "Formato inválido no header Authorization. Utilize: Bearer <token>"
            }
        )
        
    token = token_header.replace("Bearer ", "").strip()

    # 2. Verifica se token não está vazio
    if not token:
        return JSONResponse(
            status_code=APIError.UNAUTHORIZED["status_code"],
            content={
                "code": APIError.UNAUTHORIZED["code"],
                "message": "Token inválido, valor nulo"
            }
        )
    
    # 3. Valida via Graph API
    try:
        async with httpx.AsyncClient() as client: 
            response = await client.get(
                "https://graph.microsoft.com/v1.0/me",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json", 
                    "Accept": "application/json"
                },
                timeout=10.0
            )
            
            if response.status_code == 200:
                # Token válido 
                request.state.access_token = token
                request.state.user_data = response.json()  
                return await call_next(request)
            else:
                return JSONResponse(
                    status_code=APIError.UNAUTHORIZED["status_code"],
                    content={
                        "code": APIError.UNAUTHORIZED["code"],
                        "message": f"Token inválido. Graph API retornou: {response.status_code}"
                    }
                )
                
    except httpx.TimeoutException:
        return JSONResponse(
            status_code=APIError.UNAUTHORIZED["status_code"],
            content={
                "code": APIError.UNAUTHORIZED["code"],
                "message": "Timeout ao validar token com Microsoft Graph API"
            }
        )
    except httpx.ConnectError:
        return JSONResponse(
            status_code=APIError.UNAUTHORIZED["status_code"],
            content={
                "code": APIError.UNAUTHORIZED["code"],
                "message": "Não foi possível conectar com Microsoft Graph API"
            }
        )
    except Exception as e:
        return JSONResponse(
            status_code=APIError.UNAUTHORIZED["status_code"],
            content={
                "code": APIError.UNAUTHORIZED["code"],
                "message": f"Erro ao validar token: {str(e)}"
            }
        )