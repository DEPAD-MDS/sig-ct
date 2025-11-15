import type { Route } from "./+types/dashboard.repasses";
import Repasses from "../screens/dashboard/Repasses";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Sistema Integrado de Gestão de Comunidades Terapêuticas." },
    { name: "Sistema desenvolvido para o Departamento de Entidades de Acolhimento Atuantes em Álcool e Drogas", content: "Acesse o link para entrar" },
  ];
}

export default function DashboardRepasses() {
    return <Repasses/>;
}
