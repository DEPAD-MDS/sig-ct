from lib.graph_api import GraphApiService
from functions.dashboard.Geral.geral_types import comunidades_types

def get_data(token):
    service = GraphApiService(token)
    drive_id = 'b!MZPyUvPC3UmkSdLBc-yeun-_NF82IWBHuBty45ivSS2eiihS0RDLS4itf2BP_2Id'
    sheet_id = '014KROMCH7DLLFOM2QZVDZZSGZZIMKEQXJ'
    worksheet = 'Dashboard'
    initial_interval = 'A2'
    last_interval = 'AD1167'
    data = service.get_graph_spreadsheet(drive_id, sheet_id, worksheet, initial_interval, last_interval, '?$select=values')
    formatted_data = []
    for row in data:
        formatted_data.append(
        comunidades_types(
            cnpj=str(row[0]),
            razao_social=str(row[1]),
            nome_fantasia=str(row[2]),
            contrato_ano=str(row[3]),
            processo_sei=str(row[4]),
            uf=str(row[5]),
            municipio=str(row[6]),
            endereco=str(row[7]),
            telefone=str(row[8]),
            email=str(row[9]),
            vagas_contratadas=str(row[10]),
            adulto_masc=str(row[11]),
            adulto_feminino=str(row[12]),
            maes=str(row[13]),
            previsao_recurso_anual=str(row[14]),
            previsao_recurso_mensal=str(row[15]),
            data_inicial_ct=str(row[16]),
            data_vencimento_ct=str(row[17]),
            data_cronologica=str(row[18]),
            status_certificacao=str(row[19]),
            dt_inicio_certificacao_atual=str(row[20]),
            dt_fim_certificacao_atual=str(row[21]),
            tipo_instrumento=str(row[22]),
            gnd=str(row[23]),
            gnd_3=str(row[24]),
            gnd_4=str(row[25]),
            contrapartida=str(row[26]),
            valor_total_global=str(row[27]),
            latitude=str(row[28]),
            longitude=str(row[29])
        )
    )
    return formatted_data

def get_filtered_data(token, query):
    return None