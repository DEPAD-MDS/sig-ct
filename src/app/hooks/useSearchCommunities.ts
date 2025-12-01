// ~/hooks/useSearchCommunities.ts
import { useQuery } from '@tanstack/react-query';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from 'msalConfig';
import geralService from '~/services/dashboard/geralService';

// Hook específico para pesquisa (com cache compartilhado)
export function useSearchCommunities() {
  const { instance, accounts } = useMsal();

  return useQuery({
    queryKey: ['communities'], // MESMA queryKey para compartilhar cache
    queryFn: async () => {
      if (!accounts[0]) {
        throw new Error('Usuário não autenticado');
      }

      const response = await instance.acquireTokenSilent({
        ...loginRequest,
        account: accounts[0]
      });

      return geralService(response.accessToken);
    },
    enabled: !!accounts[0],
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}