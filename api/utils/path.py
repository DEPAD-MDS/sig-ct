# utils/find_real_path.py
import sys
import os
from dotenv import load_dotenv

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
load_dotenv()

from lib.graph_api import GraphApiService
from utils.refresh_token import get_access_token_from_refresh_token

def descobrir_caminho_real():
    FILE_NAME = "BASE CEBAS.xlsx"
    SITE_PATH = "sites/EquipeDEPAD" 
    HOSTNAME = os.getenv("SHAREPOINT_HOSTNAME")

    print(f"🔎 Procurando por '{FILE_NAME}' em '{SITE_PATH}'...")

    try:
        token = get_access_token_from_refresh_token()
        api = GraphApiService(f"Bearer {token}")
        
        site_endpoint = f"/sites/{HOSTNAME}:/{SITE_PATH}"
        site_data = api.get_graph_data(site_endpoint)
        site_id = site_data['id']
        print(f"Site encontrado. ID: {site_id[:10]}...")

        # Para achar o ID do arquivo
        search_endpoint = f"/sites/{site_id}/drive/root/search(q='{FILE_NAME}')"
        results = api.get_graph_data(search_endpoint)

        if not results.get('value'):
            print("ARQUIVO NÃO ENCONTRADO NA BUSCA!")
            return

        # Pega o primeiro resultado
        found_item_resumo = results['value'][0]
        item_id = found_item_resumo['id']
        drive_id = found_item_resumo['parentReference']['driveId']
        
        print(f"Arquivo localizado! ID: {item_id}")
        print("Buscando caminho completo...")

        detail_endpoint = f"/drives/{drive_id}/items/{item_id}"
        full_item = api.get_graph_data(detail_endpoint)

        full_path = full_item['parentReference']['path']

        caminho_limpo = full_path.split("root:")[-1]
        if caminho_limpo.startswith("/"):
            caminho_limpo = caminho_limpo[1:]
            
        final_path = f"{caminho_limpo}/{full_item['name']}"

        print("\n" + "="*50)
        print("CAMINHO DESCOBERTO!")
        print("="*50)
        print(f"Nome:  {full_item['name']}")
        print("-" * 50)
        print("COPIE ESTA LINHA PARA O SEU CEBAS_SERVICE.PY:")
        print(f'self.file_path = "{final_path}"')
        print("="*50)

    except Exception as e:
        print(f"Erro Detalhado: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    descobrir_caminho_real()