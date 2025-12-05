import os
import msal
from fastapi import HTTPException
from dotenv import load_dotenv

load_dotenv()

# Cache para não pedir token novo a cada milissegundo
app_instance = None

def get_access_token_from_refresh_token():
    """
    Usa o Refresh Token salvo no .env para pegar um Access Token novo.
    Funciona sem interação do usuário.
    """

    global msal_app
    
    # Debug
    token_no_env = os.getenv("AZURE_REFRESH_TOKEN")
    print(f"🔍 DEBUG: Lendo .env... Token encontrado? {'SIM' if token_no_env else 'NÃO'}")

    # Pega o ID do .env (se não tiver, usa o do PowerShell como fallback)
    client_id = os.getenv("AZURE_CLIENT_ID", "14d82eec-204b-4c2f-b7e8-296a70dab67e")
    refresh_token = token_no_env
    
    if not refresh_token:
        # Se cair aqui, é porque o load_dotenv não achou o arquivo ou o nome da variável está errado
        raise HTTPException(status_code=500, detail="Refresh Token não configurado no .env")
    
    global app_instance
    
    client_id = os.getenv("AZURE_CLIENT_ID", "14d82eec-204b-4c2f-b7e8-296a70dab67e")
    refresh_token = os.getenv("AZURE_REFRESH_TOKEN")
    
    if not refresh_token:
        raise HTTPException(status_code=500, detail="Refresh Token não configurado no .env")

    # Escopos que queremos acessar
    scopes = ["Sites.Read.All", "Files.Read.All", "User.Read"]
    
    if not app_instance:
        app_instance = msal.PublicClientApplication(
            client_id, 
            authority="https://login.microsoftonline.com/organizations"
        )

    # Tenta obter o token usando o Refresh Token
    result = app_instance.acquire_token_by_refresh_token(refresh_token, scopes=scopes)

    if "access_token" in result:
        # Opcional: Se o refresh token mudar (rolling token), poderíamos atualizar o .env, 
        # mas por enquanto vamos manter simples.
        return result['access_token']
    else:
        error_msg = result.get("error_description", "Erro desconhecido")
        raise HTTPException(status_code=401, detail=f"Falha ao renovar token. O Refresh Token pode ter expirado. Rode o script de login novamente. Erro: {error_msg}")