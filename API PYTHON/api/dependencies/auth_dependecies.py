from fastapi import Request, HTTPException, Depends
from typing import Dict, Any

async def get_current_token(request: Request) -> str:
    """
    Dependência que retorna o token do usuário autenticado
    """
    if not hasattr(request.state, 'token'):
        raise HTTPException(status_code=401, detail="Token não disponível")
    return request.state.token