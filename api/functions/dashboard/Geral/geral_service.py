from lib.graph_api import GraphApiService
from functions.dashboard.Geral.geral_types import comunidades_types

def get_data(token):
    service = GraphApiService(token)
    drive_id = 'b!MZPyUvPC3UmkSdLBc-yeun-_NF82IWBHuBty45ivSS2eiihS0RDLS4itf2BP_2Id'
    sheet_id = '014KROMCH7DLLFOM2QZVDZZSGZZIMKEQXJ'
    worksheet = 'Dashboard'
    initial_interval = 'A2'
    last_interval = 'AE670'
    data = service.get_graph_spreadsheet(drive_id, sheet_id, worksheet, initial_interval, last_interval, '?$select=values')
    formatted_data = []
    rows = data.get('values', [])
    for row in rows:
        formatted_data.append(
           comunidades_types(
                cnpj=str(row[0]) if len(row) > 0 else '',
                razao_social=str(row[1]) if len(row) > 1 else '',
                nome_fantasia=str(row[2]) if len(row) > 2 else '',
                contrato_ano=str(row[3]) if len(row) > 3 else '',
                processo_sei=str(row[4]) if len(row) > 4 else '',
                uf=str(row[5]) if len(row) > 5 else '',
                regiao=str(row[6]) if len(row) > 6 else '',
                municipio=str(row[7]) if len(row) > 7 else '',
                endereco=str(row[8]) if len(row) > 8 else '',
                telefone=str(row[9]) if len(row) > 9 else '',
                email=str(row[10]) if len(row) > 10 else '',
                vagas_contratadas=str(row[11]) if len(row) > 11 else '',
                adulto_masc=str(row[12]) if len(row) > 12 else '',
                adulto_feminino=str(row[13]) if len(row) > 13 else '',
                maes=str(row[14]) if len(row) > 14 else '',
                previsao_recurso_anual=str(row[15]) if len(row) > 15 else '',
                previsao_recurso_mensal=str(row[16]) if len(row) > 16 else '',
                data_inicial_ct=str(row[17]) if len(row) > 17 else '',
                data_vencimento_ct=str(row[18]) if len(row) > 18 else '',
                data_cronologica=str(row[19]) if len(row) > 19 else '',
                status_certificacao=str(row[20]) if len(row) > 20 else '',
                dt_inicio_certificacao_atual=str(row[21]) if len(row) > 21 else '',
                dt_fim_certificacao_atual=str(row[22]) if len(row) > 22 else '',
                tipo_instrumento=str(row[23]) if len(row) > 23 else '',
                gnd=str(row[24]) if len(row) > 24 else '',
                gnd_3=str(row[25]) if len(row) > 25 else '',
                gnd_4=str(row[26]) if len(row) > 26 else '',
                contrapartida=str(row[27]) if len(row) > 27 else '',
                valor_total_global=str(row[28]) if len(row) > 28 else '',
                latitude=str(row[29]) if len(row) > 29 else '',
                longitude=str(row[30]) if len(row) > 30 else '',
            )
    )
    return formatted_data

#TODO - CRIAR SERVIÇO DE FILTRAGEM DE DADOS SPREADSHEET

def get_filtered_data(token, query):
    get_data(token)
    return None

#TODO - CRIAR SERVIÇO DE EXCLUSIVIDADE POR NOME EM DADOS SPREADSHEET

def get_comunity_data(token, query):
    data = get_data(token)
    filters = query.get('comunity', {})
    cnpj = filters.get('cnpj', '').strip()
    name = filters.get('name', '').strip()
    results = []
    
    if not cnpj and not name:
        return data
    
    search_cnpj = ''.join(filter(str.isdigit, cnpj)) if cnpj else ''
    
    for comunidade in data:
        score = 0
        cnpj_match = False
        name_match = False
        
        # Verificação CNPJ
        if cnpj:
            clean_cnpj = ''.join(filter(str.isdigit, comunidade.cnpj))
            if search_cnpj == clean_cnpj:
                score += 100
                cnpj_match = True
            elif search_cnpj and clean_cnpj.startswith(search_cnpj[:8]):
                score += 50
                cnpj_match = True
        
        # Verificação NOME
        if name:
            # Lógica para verificar nome aqui
            pass

        if cnpj_match or name_match:
            results.append((score, comunidade))    
    results.sort(key=lambda x: x[0], reverse=True)
    return [comunidade for score, comunidade in results]