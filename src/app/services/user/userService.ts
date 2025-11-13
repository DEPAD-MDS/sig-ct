
const API_BASE_URL: string = String(import.meta.env.VITE_API_ENDPOINT);

export interface UserData {
  nome_completo: string;
  nome_abreviado: string;
  email_corporativo: string;
}

async function userService(token: string): Promise<UserData>{
  const headers = {
    method: "GET",
    headers:{
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }
      const response = await fetch(`${API_BASE_URL}/user/info`, headers)
      if (!response.ok){
        console.warn("Não foi possível localizar os dados do usuário, faça login novamente")
      }
      const data = await response.json();
      return data;
}

async function userPhotoService(token: string): Promise<Base64URLString>{
  const headers = {
    method: "GET",
    headers:{
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }
      const response = await fetch(`${API_BASE_URL}/user/picture`, headers)
      if (!response.ok){
        console.warn("Não foi possível localizar a foto do usuário, faça login novamente")
      }
      const data = await response.json();
      return data;
}


export {userService, userPhotoService};