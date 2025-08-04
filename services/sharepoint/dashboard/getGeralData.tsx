import { PublicClientApplication, InteractionType } from '@azure/msal-browser';
import { Client } from '@microsoft/microsoft-graph-client';
import { AuthCodeMSALBrowserAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/authCodeMsalBrowser';
import type { AuthCodeMSALBrowserAuthenticationProviderOptions } from '@microsoft/microsoft-graph-client/authProviders/authCodeMsalBrowser';

interface GraphError extends Error {
  statusCode?: number;
  code?: string;
}

const getGeralData = async (instance: PublicClientApplication) => {
  try {
    // Verificação mais rápida de contas
    const accounts = instance.getAllAccounts();
    if (accounts.length === 0) {
      throw new Error('Nenhum usuário autenticado encontrado');
    }

    const options: AuthCodeMSALBrowserAuthenticationProviderOptions = {
      account: accounts[0], // Usa a primeira conta disponível
      interactionType: InteractionType.Popup,
      scopes: ["user.read"]
    };

    const authProvider = new AuthCodeMSALBrowserAuthenticationProvider(instance, options);
    
    // Otimização: Configurar o client com opções de desempenho
    const graphClient = Client.initWithMiddleware({
      authProvider,
      defaultVersion: 'v1.0', // Especifica a versão da API
      debugLogging: false, // Desativa logs de debug em produção
    });

    // Otimização: Adicionar headers para cache e compressão
    const requestHeaders = {
      'Accept-Encoding': 'gzip',
      'Cache-Control': 'no-cache', // ou 'max-age=3600' se os dados mudam pouco
    };

    // Otimização: Limitar os dados retornados apenas ao necessário
    const rangeAddress = 'A1:AD1167'; // Intervalo grande - considere reduzir se possível
    
    // Medição de performance
    const startTime = performance.now();
    
    const response = await graphClient.api(`/drives/b!MZPyUvPC3UmkSdLBc-yeun-_NF82IWBHuBty45ivSS2eiihS0RDLS4itf2BP_2Id/items/014KROMCH7DLLFOM2QZVDZZSGZZIMKEQXJ/workbook/worksheets('Dashboard')/range(address='${rangeAddress}')`)
      .select('text,values')
      .headers(requestHeaders)
      .get();

    const endTime = performance.now();
    console.log(`Tempo de resposta da API: ${endTime - startTime}ms`);

    if (!response) {
      throw new Error('Dados não retornados');
    }

    // Otimização: Processar os dados em chunks se forem muito grandes
    if (response.values && Array.isArray(response.values)) {
      // Se os dados forem muito grandes, considere processar em partes
      console.log(`Dados recebidos: ${response.values.length} linhas`);
    }

    return response;
  } catch (error) {
    const graphError = error as GraphError;
    
    // Tratamento de erros otimizado
    switch (true) {
      case graphError.statusCode === 401:
        console.error('Erro de autenticação: Token inválido ou expirado');
        throw new Error('Sua sessão expirou. Por favor, faça login novamente.');
      case graphError.statusCode === 403:
        console.error('Erro de permissão: Acesso negado');
        throw new Error('Você não tem permissão para acessar estas informações.');
      case graphError.code === 'TokenExpiredError':
        console.error('Token expirado');
        throw new Error('Sua sessão expirou. Atualizando token...');
      case graphError.message?.includes('Network Error'):
        console.error('Erro de rede');
        throw new Error('Problema de conexão. Verifique sua internet e tente novamente.');
      default:
        console.error('Erro ao obter dados:', graphError);
        throw new Error('Ocorreu um erro inesperado ao carregar os dados.');
    }
  }
};

export default getGeralData;