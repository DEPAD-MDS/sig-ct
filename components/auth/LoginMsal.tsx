import { loginRequest } from "msal.config";
import { useMsal } from "@azure/msal-react";

const handleLogin = (instance: any) => {
  instance.loginRedirect(loginRequest).catch((e: any) => {
    console.error(e);
  });
};

export default function LoginMsal() {
  const { instance } = useMsal();
  return (
    <button
      className="bg-blue-900 text-white flex gap-2 items-center justify-center font-semibold m-4 px-8 py-4 rounded-lg"
      onClick={() => handleLogin(instance)}
    >
      <img src="/icons/mslogo.png" width={20}/>
      Login com a sua conta institucional
    </button>
  );
}
