import type { Route } from "./+types/dashboard.relator";
import Relator from "~/screens/dashboard/relator/Relator";
export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Sistema Integrado de Gestão de Comunidades Terapeuticas." },
    { name: "Sistema desenvolvido para o Departamento de Entidades de Acolhimento Atuantes em Álcool e Drogas", content: "Acesse o link para entrar" },
  ];
}

export default function DashboardRelatorAI() {
    return <Relator/>;
}
