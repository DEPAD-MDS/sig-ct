import { PublicClientApplication, InteractionType } from '@azure/msal-browser';
import { Client } from '@microsoft/microsoft-graph-client';
import { AuthCodeMSALBrowserAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/authCodeMsalBrowser';
import type { AuthCodeMSALBrowserAuthenticationProviderOptions } from '@microsoft/microsoft-graph-client/authProviders/authCodeMsalBrowser';

interface GraphError extends Error {
  statusCode?: number;
  code?: string;
}

const getPfp = async (instance: PublicClientApplication) => {
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

    // Obtém a foto de perfil do usuário em formato blob
    const pfpBlob = await graphClient.api('/me/photo/$value').get();
    
    if (!pfpBlob) {
      throw new Error('Foto de perfil não encontrada');
    }

    // Converte o blob para URL
    return URL.createObjectURL(pfpBlob);
  } catch (error) {
    const graphError = error as GraphError;
    
    // Tratamento especial para quando o usuário não tem foto
    if (graphError.statusCode === 404) {
      console.log('Usuário não possui foto de perfil definida');
      return null;
    } else if (graphError.statusCode === 401) {
      console.error('Erro de autenticação: Token inválido ou expirado');
      throw new Error('Sua sessão expirou. Por favor, faça login novamente.');
    } else {
      console.error('Erro ao obter foto de perfil:', graphError);
      throw new Error('Ocorreu um erro ao carregar sua foto de perfil.');
    }
  }
};

export default getPfp;