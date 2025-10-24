"""
    Duas rotas:
        - /data
        - /filter? <- sendo um query list
"""

from fastapi import APIRouter, Request
from functions.dashboard.Geral.geral_service import get_data, get_filtered_data, get_comunity_data

geral_routes = APIRouter(prefix="/geral", tags=["user"])


@geral_routes.get("/")
def test():
    return {
        "message": "Rota para obter dados da sessão Dashboard Geral"
    }

@geral_routes.get("/data")
def get_geral_data(request:Request):
    return get_data(token=request.headers.get("Authorization"))

#TODO - FAZER A REQUISIÇÃO DE MULTIPLOS FILTROS
#TODO - AVALIAR O USO DE MÉTODOS POST PARA ENVIAR FILTROS

@geral_routes.get("/data/filter")
def get_geral_filtered_data(request:Request, cnpj: str = '', razao_social: str = '', uf:str = '', cidade:str = ''):
    query = {
        'filters': {
            'cnpj' : cnpj,
            'razao_social' : razao_social,
            'uf': uf,
            'cidade':cidade
        }
    }
    return get_filtered_data(token=request.headers.get("Authorization"), query=query)

#TODO - FAZER A REQUISIÇÃO ÚNICA POR NOME DE COMUNIDADE

@geral_routes.get("/comunidade")
def get_geral_comunity_data(request:Request, name: str='', cnpj:str=''):
    query = {
        'comunity': {
            'cnpj' : cnpj,
            'name' : name,
        }
    }
    return get_comunity_data(token=request.headers.get("Authorization"), query=query)