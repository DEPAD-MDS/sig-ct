from pydantic import BaseModel, Field
from typing import Optional

class comunidades_types(BaseModel):
        cnpj: str 
        razao_social: str 
        nome_fantasia: str
        contrato_ano: str 
        processo_sei: str
        uf: str 
        regiao:str
        municipio: str 
        endereco: str 
        telefone: str 
        email: str 
        vagas_contratadas: str
        adulto_masc: str
        adulto_feminino: str
        maes: str
        previsao_recurso_anual: str
        previsao_recurso_mensal: str 
        data_inicial_ct: str
        data_vencimento_ct: str
        data_cronologica: str
        status_certificacao: str 
        dt_inicio_certificacao_atual: str
        dt_fim_certificacao_atual: str 
        tipo_instrumento: str 
        gnd: str
        gnd_3: str
        gnd_4: str
        contrapartida: str 
        valor_total_global: str 
        latitude: str 
        longitude: str