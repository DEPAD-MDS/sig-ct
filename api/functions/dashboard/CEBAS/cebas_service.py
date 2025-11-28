import os
from lib.graph_api import GraphApiService

class CebasService:
    def __init__(self, token: str):
        self.graph_service = GraphApiService(token)
        self.hostname = os.getenv("SHAREPOINT_HOSTNAME") # Pega do .env pois é global
        self.site_path = "sites/EquipeDEPAD" 
        self.file_path = "General/DEPAD/Cebas/BASE CEBAS.xlsx"
        self.worksheet = "GRÁFICOS"

    def get_cebas_dashboard_data(self):
        raw_data = self.graph_service.get_spreadsheet_by_path(
            hostname=self.hostname,
            site_path=self.site_path,
            file_path=self.file_path,
            worksheet=self.worksheet,
            initial_interval="A1",
            last_interval="Z100"
        )
        
        return self._process_data(raw_data)

    def _process_data(self, data):

        return data