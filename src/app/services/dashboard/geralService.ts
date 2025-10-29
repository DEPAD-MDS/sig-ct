export interface CommunityData {
    cnpj: string;
    razao_social: string;
    nome_fantasia: string;
    contrato_ano: string;
    processo_sei: string;
    uf: string;
    municipio: string;
    endereco: string;
    telefone: string;
    email: string;
    vagas_contratadas: string;
    adulto_masc: string;
    adulto_feminino: string;
    maes: string;
    previsao_recurso_anual: string;
    previsao_recurso_mensal: string;
    data_inicial_ct: string;
    data_vencimento_ct: string;
    latitude: string;
    longitude: string;
}

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

async function geralService(token: string): Promise<CommunityData[]> {
    const headers = {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    }
    const response = await fetch(`${API_BASE_URL}/geral/data`, headers)
    if (!response.ok) {
        throw new Error(`Erro ao buscar comunidades: ${response.status}`);
    }
    const data = await response.json();
    return data;
}

export default geralService;