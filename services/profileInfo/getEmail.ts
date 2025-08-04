import { PublicClientApplication, InteractionType } from '@azure/msal-browser';
import { Client } from '@microsoft/microsoft-graph-client';
import { AuthCodeMSALBrowserAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/authCodeMsalBrowser';
import type { AuthCodeMSALBrowserAuthenticationProviderOptions } from '@microsoft/microsoft-graph-client/authProviders/authCodeMsalBrowser';

interface GraphError extends Error {
  statusCode?: number;
  code?: string;
}

const getEmail = async (instance: PublicClientApplication) => {
  try {
    // Verifica se há contas disponíveis
    const accounts = instance.getAllAccounts();
    if (accounts.length === 0) {
      throw new Error('Nenhum usuário autenticado encontrado');
    }

    const options: AuthCodeMSALBrowserAuthenticationProviderOptions = {
      account: accounts[0],
      interactionType: InteractionType.Popup,
      scopes: ["user.read", "mail.read"]
    };

    const authProvider = new AuthCodeMSALBrowserAuthenticationProvider(instance, options);
    const graphClient = Client.initWithMiddleware({ authProvider });

    // Obtém o email do usuário
    const user = await graphClient.api('/me').select('mail,userPrincipalName').get();
    
    if (!user) {
      throw new Error('Dados do usuário não retornados');
    }

    // Retorna o email principal ou o userPrincipalName como fallback
    return user.mail || user.userPrincipalName;
  } catch (error) {
    const graphError = error as GraphError;
    
    if (graphError.statusCode === 401) {
      console.error('Erro de autenticação: Token inválido ou expirado');
      throw new Error('Sua sessão expirou. Por favor, faça login novamente.');
    } else if (graphError.statusCode === 403) {
      console.error('Erro de permissão: Acesso negado');
      throw new Error('Você não tem permissão para acessar estas informações.');
    } else {
      console.error('Erro ao obter email do usuário:', graphError);
      throw new Error('Ocorreu um erro ao obter seu endereço de email.');
    }
  }
};

export default getEmail;