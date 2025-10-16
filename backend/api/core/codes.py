# app/core/errors.py
from typing import Dict, Any, Optional
from fastapi import HTTPException, status

class APIError:    
    UNAUTHORIZED = {
        "code": "UNAUTHORIZED",
        "message": "Token de acesso inválido ou expirado",
        "status_code": status.HTTP_401_UNAUTHORIZED
    }
    
    FORBIDDEN = {
        "code": "FORBIDDEN", 
        "message": "Permissões insuficientes para acessar este recurso",
        "status_code": status.HTTP_403_FORBIDDEN
    }
    
    NOT_FOUND = {
        "code": "NOT_FOUND",
        "message": "Recurso não encontrado",
        "status_code": status.HTTP_404_NOT_FOUND
    }
    
    GRAPH_API_ERROR = {
        "code": "GRAPH_API_ERROR",
        "message": "Erro ao comunicar com Microsoft Graph API",
        "status_code": status.HTTP_502_BAD_GATEWAY
    }
    
    VALIDATION_ERROR = {
        "code": "VALIDATION_ERROR",
        "message": "Dados de entrada inválidos",
        "status_code": status.HTTP_422_UNPROCESSABLE_ENTITY
    }

def create_http_exception(error_type: Dict[str, Any], detail: Optional[str] = None) -> HTTPException:
    return HTTPException(
        status_code=error_type["status_code"],
        detail={
            "code": error_type["code"],
            "message": detail or error_type["message"]
        }
    )