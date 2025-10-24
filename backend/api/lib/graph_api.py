import requests
import base64

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
        response = requests.get(url, headers=self.headers)
        response.raise_for_status()
        return response.json()
    
    def get_graph_bytes(self, endpoint):
        url = f"{self.graph_api_url}{endpoint}"
        headers = {
            'Authorization': f'{self.token}'
        }
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return base64.b64encode(response.content).decode('utf-8')
        
#TODO - REALIZAR SISTEMA DE CACHE PARA A FUNÇÃO get_graph_spreadshet() PARA MELHOR DESEMPENHO DAS RESPONSES 

    def get_graph_spreadsheet(self, drive_id, sheet_id, worksheet, initial_interval, last_interval, params=None):
        url = f"{self.graph_api_url}/drives/{drive_id}/items/{sheet_id}/workbook/worksheets('{worksheet}')/range(address='{initial_interval}:{last_interval}'){params}"
        response = requests.get(url, headers=self.headers)
        response.raise_for_status()
        return response.json()
    