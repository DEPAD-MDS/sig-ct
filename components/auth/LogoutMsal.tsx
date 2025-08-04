import { loginRequest } from "msal.config";
import { useMsal } from "@azure/msal-react";

const handleLogin = (instance: any) => {
  instance.logoutRedirect(loginRequest).catch((e: any) => {
    console.error(e);
  });
};

export default function LogoutMsal() {
  const { instance } = useMsal();
  return (
    <button
      className="bg-blue-700 m-4 px-6 py-4 rounded-lg"
      onClick={() => handleLogin(instance)}
    >
        Fazer logout
    </button>
  );
}
