import json
import time
import requests
from fastapi import HTTPException
from utils.cache import token_cache, CACHE_TIMEOUT

async def get_geral_data_from_token(token: str) -> dict:
    """
    Service que recebe um token e retorna dados da planilha Excel do Graph API
    """
    GRAPH_API_URL = "https://graph.microsoft.com/v1.0/drives/b!MZPyUvPC3UmkSdLBc-yeun-_NF82IWBHuBty45ivSS2eiihS0RDLS4itf2BP_2Id/items/014KROMCH7DLLFOM2QZVDZZSGZZIMKEQXJ/workbook/worksheets('Dashboard')/range(address='A1:AD1167')"
    
    # Verifica cache primeiro
    cache_key = f"geral_data_{token}"
    if cache_key in token_cache:
        cached_data = token_cache[cache_key]
        if time.time() - cached_data['timestamp'] < CACHE_TIMEOUT:
            return cached_data['data']
    


    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Accept-Encoding": "gzip",
        "Cache-Control": "no-cache"
    }
    
    try:
        # Faz a request para Graph API
        response = requests.get(GRAPH_API_URL, headers=headers, timeout=30)
        response.raise_for_status()
        
        data = response.json()
        
        if not data:
            raise HTTPException(status_code=404, detail="Dados não retornados")
        
        # Adiciona ao cache
        token_cache[cache_key] = {
            'data': data,
            'timestamp': time.time()
        }
        
        return data
        
    except requests.exceptions.HTTPError as http_err:
        if http_err.response.status_code == 401:
            raise HTTPException(status_code=401, detail="Token inválido ou expirado")
        elif http_err.response.status_code == 403:
            raise HTTPException(status_code=403, detail="Permissões insuficientes")
        elif http_err.response.status_code == 404:
            raise HTTPException(status_code=404, detail="Recurso não encontrado")
        else:
            raise HTTPException(
                status_code=http_err.response.status_code, 
                detail=f"Erro na requisição: {str(http_err)}"
            )
    
    except requests.exceptions.RequestException as req_err:
        raise HTTPException(status_code=500, detail=f"Erro de conexão: {str(req_err)}")
    
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Erro ao processar resposta da API")

def transform_to_json_format(data: dict) -> list:
    """
    Transforma os dados da planilha em array de objetos JSON
    """
    values = data.get('values', [])
    
    if not values or len(values) < 2:
        return []
    
    # A primeira linha são os cabeçalhos
    headers = values[0]
    
    # As demais linhas são os dados
    result = []
    for row_index, row in enumerate(values[1:], start=1):
        if not row:  # Pula linhas vazias
            continue
            
        obj = {}
        for col_index, header in enumerate(headers):
            if col_index < len(row):
                # Converte valores vazios para None
                value = row[col_index] if row[col_index] != "" else None
                obj[header] = value
            else:
                obj[header] = None
        
        # Adiciona um ID baseado no índice da linha (opcional)
        obj["id"] = row_index
        result.append(obj)
    
    return result

async def get_filtered_geral_data(token: str) -> dict:
    """
    Versão que retorna os dados transformados em JSON formatado
    """
    full_data = await get_geral_data_from_token(token)
    transformed_data = transform_to_json_format(full_data)
    
    return {
        "status": "success",
        "data": transformed_data
    }