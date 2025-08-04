import { PublicClientApplication, InteractionType } from '@azure/msal-browser';
import { Client } from '@microsoft/microsoft-graph-client';
import { AuthCodeMSALBrowserAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/authCodeMsalBrowser';
import type { AuthCodeMSALBrowserAuthenticationProviderOptions } from '@microsoft/microsoft-graph-client/authProviders/authCodeMsalBrowser';

interface GraphError extends Error {
  statusCode?: number;
  code?: string;
}

const getUser = async (instance: PublicClientApplication) => {
  try {
    // Verifica se há contas disponíveis
    const accounts = instance.getAllAccounts();
    if (accounts.length === 0) {
      throw new Error('Nenhum usuário autenticado encontrado');
    }

    const options: AuthCodeMSALBrowserAuthenticationProviderOptions = {
      account: accounts[0],
      interactionType: InteractionType.Popup,
      scopes: ["user.read"]
    };

    const authProvider = new AuthCodeMSALBrowserAuthenticationProvider(instance, options);
    const graphClient = Client.initWithMiddleware({ authProvider });

    // Tenta obter os dados do usuário
    const user = await graphClient.api('/me').get();
    
    if (!user) {
      throw new Error('Dados do usuário não retornados');
    }

    return user;
  } catch (error) {
    const graphError = error as GraphError;
    
    // Tratamento específico para erros conhecidos
    if (graphError.statusCode === 401) {
      console.error('Erro de autenticação: Token inválido ou expirado');
      throw new Error('Sua sessão expirou. Por favor, faça login novamente.');
    } else if (graphError.statusCode === 403) {
      console.error('Erro de permissão: Acesso negado');
      throw new Error('Você não tem permissão para acessar estas informações.');
    } else if (graphError.code === 'TokenExpiredError') {
      console.error('Token expirado');
      throw new Error('Sua sessão expirou. Atualizando token...');
    } else if (graphError.message?.includes('Network Error')) {
      console.error('Erro de rede');
      throw new Error('Problema de conexão. Verifique sua internet e tente novamente.');
    } else {
      console.error('Erro ao obter dados do usuário:', graphError);
      throw new Error('Ocorreu um erro inesperado ao carregar seus dados.');
    }
  }
};

export default getUser;