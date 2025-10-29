import { loginRequest } from 'msalConfig';
import { useState, useEffect } from 'react';
import geralService, {type CommunityData} from '~/services/dashboard/geralService'
import { useMsal } from '@azure/msal-react';

export function useGeralData() {
    const [communities, setCommunities] = useState<CommunityData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const {instance, accounts} = useMsal()
    const [token, setToken] = useState("") 
    useEffect(() => {
        const acquireToken = async () => {
            try {
                const response = await instance.acquireTokenSilent({
                    ...loginRequest,
                    account: accounts[0]
                });
                setToken(response.accessToken);
                setError(null);
            } catch (err: any) {
                setError(err.message || "Erro ao obter token");
                setLoading(false);
            }
        }
        
        if (accounts[0]) {
            acquireToken();
        }
    }, [instance, accounts]);

    useEffect(() => {
        const fetchCommunities = async () => {
            if (!token) return; 
            
            try {
                setLoading(true);
                setError(null);
                const data = await geralService(token);
                setCommunities(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erro ao carregar comunidades');
            } finally {
                setLoading(false);
            }
        };
        
        fetchCommunities();
    }, [token]);
    
    return { communities, loading, error };
}

