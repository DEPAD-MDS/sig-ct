import type { Route } from "./+types/dashboard.contratos";
import Contratos from "~/screens/dashboard/Contratos";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Sistema Integrado de Gestão de Comunidades Terapêuticas." },
    { name: "Sistema desenvolvido para o Departamento de Entidades de Acolhimento Atuantes em Álcool e Drogas", content: "Acesse o link para entrar" },
  ];
}

export default function DashboardContratos() {
    return <Contratos/>;
}
