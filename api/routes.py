from fastapi import APIRouter, Depends, HTTPException, Query
from api.modules.setores.geral import get_filtered_geral_data, get_geral_data_from_token
from api.modules.user import get_user_from_token
from api.dependencies.auth_dependecies import get_current_token

router = APIRouter()

@router.get("/me")
async def get_user_me(token: str = Depends(get_current_token)):
    """
    Endpoint que retorna os dados do usuário usando o service
    """
    try:
        user_data = await get_user_from_token(token)
        return {
            "success": True,
            "user": user_data,
            "message": "Dados obtidos do Microsoft Graph API"
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")
    

@router.get("/data/geral/")
async def get_filtered_geral_data_route(token: str = Depends(get_current_token)):
    """
    Endpoint que retorna dados formatados como array de objetos JSON
    """
    try:
        data = await get_filtered_geral_data(token)
        return data
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")
    

@router.get("/data/geral/filter")
async def get_filtered_geral_data_route(
    token: str = Depends(get_current_token),
    name: str = Query(..., description="Filtrar por razão social (busca parcial)")
):  
    """
    Endpoint que retorna registros filtrados por razão social (busca parcial)
    """
    try:
        # Busca todos os dados
        full_data = await get_geral_data_from_token(token)
        values = full_data.get('values', [])
        
        if not values or len(values) < 2:
            return {"data": []}
        
        headers = values[0]
        result = []
        
        # Encontra o índice da coluna "RAZÃO SOCIAL"
        razao_social_index = None
        for i, header in enumerate(headers):
            if header.upper() == "RAZÃO SOCIAL":
                razao_social_index = i
                break
        
        if razao_social_index is None:
            return {"data": []}
        
        # Procura por nomes que contenham o termo (case-insensitive)
        for row_index, row in enumerate(values[1:], start=1):
            if not row:
                continue
            
            if (razao_social_index < len(row) and 
                row[razao_social_index] and 
                name.lower() in row[razao_social_index].lower()):
                
                # Cria o objeto completo com todos os campos
                obj = {}
                for col_index, header in enumerate(headers):
                    if col_index < len(row):
                        # Converte valores vazios para None
                        value = row[col_index] if row[col_index] != "" else None
                        obj[header] = value
                    else:
                        obj[header] = None
                
                # Adiciona o ID
                obj["id"] = row_index
                
                # Adiciona ao resultado
                result.append(obj)
        
        return {
            "data": result,

        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")