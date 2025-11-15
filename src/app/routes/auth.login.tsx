import type { Route } from "./+types/auth.login";
import Login from "../screens/auth/login";
import { useMsal } from "@azure/msal-react";
import { Navigate } from "react-router";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Entre no Sistema Integrado de Gestão de Comunidades Terapêuticas." },
    { name: "Sistema desenvolvido para o Departamento de Entidades de Acolhimento Atuantes em Álcool e Drogas", content: "Acesse o link para entrar" },
  ];
}

export default function AuthLogin() {
  const { accounts } = useMsal();
  if (accounts.length > 0) {
    return (<Navigate to={"/dashboard"} />)
  } else {
    return <Login />
  }
}
