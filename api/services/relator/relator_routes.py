import os
from fastapi import APIRouter
import httpx
from toon import encode
relator_routes = APIRouter(prefix="/relator", tags=["Relator"]);

@relator_routes.post("/chat")
def post_chat(token: str, data: dict):
    pass
  
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "")
DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"

@relator_routes.post("/presentation")
async def create_presentation(data: dict):
    """Processa dados e gera relatório com DeepSeek"""
    
    # Extrai os dados principais
    description = data.get("description", "Sem descrição")
    dashboard_data = data.get("dashboardData", {})
    
    # Converte os dados para formato Toon
    toon_data = encode(dashboard_data)
    
    # Prepara o prompt para o DeepSeek
    prompt = f"""
Contexto do usuário: {description}

Dados do dashboard em formato Toon:
{toon_data}
você é um analista de dados.
Com base nos dados acima e no contexto fornecido, gere um relatório conciso em markdown com:

1. **Título** - Um título apropriado
2. **Resumo Executivo** - 2-3 frases principais
3. **Análise dos Dados** - Principais insights observados

Formate a resposta em markdown e seja direto ao ponto.
"""
    
    # Faz a chamada para a API do DeepSeek
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                DEEPSEEK_API_URL,
                headers={
                    "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
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