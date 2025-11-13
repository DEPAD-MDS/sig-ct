import { loginRequest } from "msalConfig";
import { useMsal } from "@azure/msal-react";
import { useState, useEffect } from "react";
import { userPhotoService, type UserData, userService } from "~/services/user/userService";


export function useUserData(){
  const [userData, setUserData] = useState<UserData>()
  const [userPhoto, setUserPhoto] = useState<Base64URLString>()
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const {instance, accounts} = useMsal()
  const [token, setToken] = useState<string>()
  useEffect(() => {
    const acquireToken = async () =>{
      try{
        const response = await instance.acquireTokenSilent({
          ...loginRequest,
          account: accounts[0]
        });
        setToken(response.accessToken);
        setError(null)
      }catch(err: any){
        setError(err.message || "Erro ao obter o token")
      }
    }
    if(accounts[0]){
      acquireToken();
    }
  }, [instance, accounts])
  useEffect(()=>{
    const fetchUserData = async () =>{
      if(!token) return;
      try{
        setLoading(true)
        setError(null)
        const data = await userService(token)
        setUserData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao tentar carregar seus dados")
      } finally {
        setLoading(false);
      }
    }
    fetchUserData();
  },[token])

    useEffect(()=>{
    const fetchUserPhotoData = async () =>{
      if(!token) return;
      try{
        setLoading(true)
        setError(null)
        const data = await userPhotoService(token)
        setUserPhoto(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao tentar carregar seus dados")
      } finally {
        setLoading(false);
      }
    }
    fetchUserPhotoData();
  },[token])
    return { userData, userPhoto, loading, error };
}

  