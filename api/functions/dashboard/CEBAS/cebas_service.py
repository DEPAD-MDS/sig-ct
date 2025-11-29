import os
from lib.graph_api import GraphApiService

class CebasService:
    def __init__(self, token: str):
        self.graph_service = GraphApiService(token)
        self.hostname = os.getenv("SHAREPOINT_HOSTNAME") 
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
        if not data or 'values' not in data:
            return {}

        rows = data['values']
        
        # --- 1. Definição Fixa de Colunas ---
        idx_label = 1
        idx_valor = 2

        dashboard_data = {
            "resumo": [],
            "detalhes": {}
        }
        
        current_category = "ANALÍTICO" 
        dashboard_data["detalhes"][current_category] = []

        for row in rows:
            if not row or len(row) <= max(idx_label, idx_valor):
                continue
                
            raw_label = row[idx_label]
            raw_val = row[idx_valor]

            label = str(raw_label).strip() if raw_label else ""
            
            # Verifica se o Rótulo é, na verdade, um número (ex: "357", "2024")
            is_label_numeric = label.replace('.', '', 1).isdigit()

            # Tenta converter o Valor para número
            valor = None
            if isinstance(raw_val, (int, float)):
                valor = raw_val
            elif raw_val and str(raw_val).replace('.', '', 1).isdigit():
                try:
                    valor = float(raw_val)
                except:
                    valor = None

            if label and not is_label_numeric and (valor is None or valor == ""):
                current_category = label
                if current_category not in dashboard_data["detalhes"]:
                    dashboard_data["detalhes"][current_category] = []
                continue

            if label and valor is not None:
                item = {
                    "label": label,
                    "value": valor
                }
                
                # Regra especial: Se a categoria for Analítico, joga no resumo também para facilitar cards
                if current_category == "ANALÍTICO":
                    dashboard_data["resumo"].append(item)
            
                if current_category in dashboard_data["detalhes"]:
                    dashboard_data["detalhes"][current_category].append(item)
                else:
                    # Fallback caso a categoria tenha se perdido
                    dashboard_data["detalhes"]["Outros"] = [item]

        return dashboard_data