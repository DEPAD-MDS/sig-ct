import requests
import base64
from fastapi import HTTPException
import json

#TODO - CRIAR TRATAMENTO DE ERROS 401 DA GRAPH API (TOKENS INVÁLIDOS)

class GraphApiService:
    def __init__(self, token):
        self.token = token
        self.graph_api_url = "https://graph.microsoft.com/v1.0"
        self.headers = {
            "Authorization": f"{self.token}",
            "Content-Type": "application/json"
        }
        
    def get_graph_data(self, endpoint):
        url = f"{self.graph_api_url}{endpoint}"
        try:
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
        except requests.exceptions.HTTPError as http_err:
            if response.status_code == 401:
                raise HTTPException(status_code=401, detail="Token inválido ou expirado")
            elif response.status_code == 403:
                raise HTTPException(status_code=403, detail="Permissões insuficientes para esse recurso")
        except requests.exceptions.RequestException as req_err:
            raise HTTPException(status_code=500, detail=f"Erro de conexão com os servidores da Graph API: {req_err}")
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail="Erro ao processar a resposta da API")
        return response.json()
    
    
    def get_graph_bytes(self, endpoint):
        url = f"{self.graph_api_url}{endpoint}"
        headers = {
            'Authorization': f'{self.token}'
        }
        try:
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
        except requests.exceptions.HTTPError as http_err:
            if response.status_code == 401:
                raise HTTPException(status_code=401, detail="Token inválido ou expirado")
            elif response.status_code == 403:
                raise HTTPException(status_code=403, detail="Permissões insuficientes para esse recurso")
        except requests.exceptions.RequestException as req_err:
            raise HTTPException(status_code=500, detail=f"Erro de conexão com os servidores da Graph API: {req_err}")
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail="Erro ao processar a resposta da API")    
        return base64.b64encode(response.content).decode('utf-8')
        
#TODO - REALIZAR SISTEMA DE CACHE PARA A FUNÇÃO get_graph_spreadshet() PARA MELHOR DESEMPENHO DAS RESPONSES 

    def get_graph_spreadsheet(self, drive_id, sheet_id, worksheet, initial_interval, last_interval, params=None):
        url = f"{self.graph_api_url}/drives/{drive_id}/items/{sheet_id}/workbook/worksheets('{worksheet}')/range(address='{initial_interval}:{last_interval}'){params}"
        try:
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
        except requests.exceptions.HTTPError as http_err:
            if response.status_code == 401:
                raise HTTPException(status_code=401, detail="Token inválido ou expirado")
            elif response.status_code == 403:
                raise HTTPException(status_code=403, detail="Permissões insuficientes para esse recurso")
        except requests.exceptions.RequestException as req_err:
            raise HTTPException(status_code=500, detail=f"Erro de conexão com os servidores da Graph API: {req_err}")
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail="Erro ao processar a resposta da API")
        return response.json()
    