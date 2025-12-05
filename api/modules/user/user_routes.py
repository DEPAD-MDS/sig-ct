"""
    Duas rotas:
        - /info
        - /picture
"""

from fastapi import APIRouter, Request
from functions.user.user_service import get_info, get_picture

user_routes = APIRouter(prefix="/user", tags=["user"])

@user_routes.get("/")
def teste():
    return {
        "message":"Rota para retirar informações de usuário pelo token"
    }

@user_routes.get("/info")
def get_profile_info(request: Request):
    return get_info(token=request.headers.get("Authorization"))

@user_routes.get("/picture")
def get_profile_picture(request: Request):
    return get_picture(token=request.headers.get("Authorization"))