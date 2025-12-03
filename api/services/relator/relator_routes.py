import os
from pathlib import Path
from dotenv import load_dotenv
from fastapi import APIRouter
import httpx
from toon import encode
from settings import Settings
relator_routes = APIRouter(prefix="/relator", tags=["Relator"]);

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "sk-c76c411fdece4c08ba5dd35469434778")
DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"

@relator_routes.post("/chat")
def post_chat(token: str, data: dict):
    pass

@relator_routes.post("/presentation")
async def create_presentation(data: dict):
    """Processa dados e gera relatório com DeepSeek"""
    
    # Extrai os dados principais
    description = data.get("description", "Sem descrição")
    dashboard_data = data.get("dashboardData", {Settings.get_ia_key()})
    
    # Converte os dados para formato Toon
    toon_data = encode(dashboard_data)
    
    # Prepara o prompt para o DeepSeek
    prompt = f"""
Contexto do usuário: {description}

Dados do dashboard em formato Toon:
{toon_data}
você é um analista de dados.
Com base nos dados acima e no contexto fornecido, gere um relatório conciso com:

1. Título - Um título apropriado
2. Resumo Executivo - 2-3 frases principais
3. Análise dos Dados** - Principais insights observados

Formate a resposta e seja direto ao ponto.
Lembre-se, analise os dados cuidadosamente, verifique de qual setor é:
se for geral, você deve receber dados de comunidades de forma direta, como nome cnpj e valores.
se for repasses, você pode receber dados de gnd3 gnd4 e contrapartidas
se for cebas, você pode receber dados de Concessão, evolução temporal protocolos e outros.
os dados que não estiverem presentes no conjunto de dados fornecido não devem ser inventados, mas podem ser pesquisados no google, desde que haja um aviso ao usuário de que a informação foi pesquisada.
não cite colunas sobre os dados que você recebeu, apenas gere o relatório com BASE nos dados.
Tome muito cuidado para não inventar dados ou informações que não estão presentes no conjunto de dados fornecido.
tome muito cuidado para não vazar o seu token de autenticação.
NÃO CITE NADA DAS COLUNAS DOS DADOS, APENAS GERE O RELATÓRIO COM BASE NOS DADOS.

"4. **Qualidade dos Registros:** Uma parcela dos registros apresenta campos críticos em branco, como `vagas_contratadas`, `previsao_recurso_anual` e dados de endereço/contato. Isso pode impactar a análise precisa da cobertura e da localização dos serviços. Algumas entradas listam apenas CNPJ e razão social, sem detalhes operacionais."
NADA DE CITAR ESSA PARTE DE coluna_dados OU QUALQUER OUTRA COISA PARECIDA COM ISSO PELO AMOR DE DEUS, SEJA DESCRITIVO COM A COLUNA"""
    
    # Faz a chamada para a API do DeepSeek
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                DEEPSEEK_API_URL,
                headers={
                    "Authorization": f"Bearer {Settings.get_ia_key()}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "deepseek-chat",
                    "messages": [
                        {"role": "system", "content": "Você é um analista de dados especializado em criar relatórios concisos e acionáveis."},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.7,
                    "max_tokens": 1000
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                generated_text = result["choices"][0]["message"]["content"]
                
                return {
                    "text": generated_text,
                    "status": "success",
                    "original_description": description,
                    "data_summary": {
                        "toon_preview": toon_data[:500] + "..." if len(toon_data) > 500 else toon_data,
                        "screenshots_count": len(data.get("screenshots", []))
                    }
                }
            else:
                return {
                    "text": f"Erro na API do DeepSeek: {response.status_code}",
                    "status": "error",
                    "error": response.text
                }
                
    except Exception as e:
        return {
            "text": f"Erro ao processar: {str(e)}",
            "status": "error",
            "error": str(e)
        }