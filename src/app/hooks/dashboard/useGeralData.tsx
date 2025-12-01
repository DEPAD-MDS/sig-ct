import { loginRequest } from 'msalConfig';
import { useState, useEffect } from 'react';
import geralService, { type CommunityData } from '~/services/dashboard/geralService';
import { useMsal } from '@azure/msal-react';

// Hook separado para o token
function useAuthToken() {
  const { instance, accounts } = useMsal();
  const [token, setToken] = useState("");

  useEffect(() => {
    const acquireToken = async () => {
      if (accounts[0]) {
        try {
          const response = await instance.acquireTokenSilent({
            ...loginRequest,
            account: accounts[0]
          });
          setToken(response.accessToken);
        } catch (err) {
          console.error('Erro ao obter token:', err);
        }
      }
    };

    acquireToken();
  }, [instance, accounts]);

  return token;
}

// Hook principal com cache
 export function useGeralData() {
  const token = useAuthToken();
  const [data, setData] = useState<CommunityData[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setData(null);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await geralService(token);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Erro ao buscar dados'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token]);

  return { data, isLoading, error };
}