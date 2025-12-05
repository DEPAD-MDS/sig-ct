import requests
import base64
from fastapi import HTTPException
import json
from functools import wraps

PATH_ID_CACHE = {}

def handle_graph_api_errors(func):
    @wraps(func)
    def wrapper(self, *args, **kwargs):
        try:
            return func(self, *args, **kwargs)
        except requests.exceptions.HTTPError as http_err:
            if hasattr(http_err, 'response') and http_err.response is not None:
                status_code = http_err.response.status_code
                if status_code == 401:
                    raise HTTPException(status_code=401, detail="Token inválido ou expirado")
                elif status_code == 403:
                    raise HTTPException(status_code=403, detail="Permissões insuficientes para esse recurso")
                else:
                    raise HTTPException(status_code=status_code, detail=f"Erro na Graph API: {http_err}")
            else:
                raise HTTPException(status_code=500, detail=f"Erro HTTP: {http_err}")
        except requests.exceptions.RequestException as req_err:
            raise HTTPException(status_code=500, detail=f"Erro de conexão com os servidores da Graph API: {req_err}")
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail="Erro ao processar a resposta da API")
    return wrapper

class GraphApiService:
    def __init__(self, token):
        self.token = token
        self.graph_api_url = "https://graph.microsoft.com/v1.0"
        self.headers = {
            "Authorization": f"{self.token}",
            "Content-Type": "application/json"
        }
        self.hostname = "graph.microsoft.com"
        
    @handle_graph_api_errors
    def get_graph_data(self, endpoint):
        url = f"{self.graph_api_url}{endpoint}"
        response = requests.get(url, headers=self.headers)
        response.raise_for_status()
        return response.json()
    
    @handle_graph_api_errors
    def get_graph_bytes(self, endpoint):
        url = f"{self.graph_api_url}{endpoint}"
        response = requests.get(url, headers=self.headers)
        response.raise_for_status()
        return base64.b64encode(response.content).decode('utf-8')
        
#TODO - REALIZAR SISTEMA DE CACHE PARA A FUNÇÃO get_graph_spreadshet() PARA MELHOR DESEMPENHO DAS RESPONSES 
    
    @handle_graph_api_errors
    def get_graph_spreadsheet(self, drive_id, sheet_id, worksheet, initial_interval, last_interval, params=None):
        params_str = params if params else ""
        url = f"{self.graph_api_url}/drives/{drive_id}/items/{sheet_id}/workbook/worksheets('{worksheet}')/range(address='{initial_interval}:{last_interval}'){params_str}"
        
        response = requests.get(url, headers=self.headers)
        response.raise_for_status()
        return response.json()
    
    def get_graph_spreadsheet_toon():
        pass