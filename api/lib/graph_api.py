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
        
    @handle_graph_api_errors
    def get_graph_data(self, endpoint):
        url = f"{self.graph_api_url}{endpoint}"
        response = requests.get(url, headers=self.headers)
        response.raise_for_status()
        return response.json()
    
    @handle_graph_api_errors
    def get_spreadsheet_by_path(self, hostname, site_path, file_path, worksheet, initial_interval, last_interval):
        """
        Método Inteligente: Verifica se já temos o ID em cache. 
        Se não, busca o ID pelo caminho e depois busca a planilha.
        """
        cache_key = f"{site_path}/{file_path}"
        
        # Verifica Cache
        if cache_key in PATH_ID_CACHE:
            print(f"⚡ Usando Cache para: {file_path}")
            ids = PATH_ID_CACHE[cache_key]
        else:
            print(f"Resolvendo IDs para: {file_path}")
            ids = self.get_ids_by_path(hostname, site_path, file_path)
            PATH_ID_CACHE[cache_key] = ids

        # Busca a planilha usando os IDs descobertos
        return self.get_graph_spreadsheet(
            drive_id=ids['drive_id'],
            sheet_id=ids['item_id'],
            worksheet=worksheet,
            initial_interval=initial_interval,
            last_interval=last_interval
        )
    
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

    @handle_graph_api_errors
    def get_ids_by_path(self, hostname: str, site_path: str, file_path: str):
        """
        Descobre Drive ID e Item ID baseados no nome do site e caminho do arquivo.
        """
        # Endpoint: /sites/{hostname}:/{site-path}
        print(f"--- Buscando Site: {site_path} ---")
        site_endpoint = f"/sites/{hostname}:/{site_path}"
        site_data = self.get_graph_data(site_endpoint)
        site_id = site_data['id']
        print(f"Site ID Encontrado: {site_id}")

        # O endpoint '/drive/root:/caminho' acessa a biblioteca de documentos PADRÃO do site
        print(f"--- Buscando Arquivo: {file_path} ---")
        file_endpoint = f"/sites/{site_id}/drive/root:/{file_path}"
        file_data = self.get_graph_data(file_endpoint)
        
        item_id = file_data['id']
        drive_id = file_data['parentReference']['driveId']
        
        return {
            "drive_id": drive_id,
            "item_id": item_id,
            "name": file_data['name']
        }