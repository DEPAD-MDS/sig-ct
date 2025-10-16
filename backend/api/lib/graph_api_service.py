from typing import Any, Dict


class GraphApiService:
    def __init__(self):
        access_token = '__TOKEN TESTE__'
        self.access_token = access_token
        self.base_url = "https://graph.microsoft.com/v1.0"
        
    async def get_graph_data(self, endpoint: str) -> Dict[str, Any]:
        data = ''
        return data
        
    async def get_spreadsheet_data(self, drive_id:str, file_id:str, column: str, rows:str)-> Dict[str, Any]:
        data = {}
        return data