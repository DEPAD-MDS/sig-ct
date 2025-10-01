import type { Route } from "./+types/dashboard.cebas";
import Cebas from "../screens/dashboard/Cebas";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Sistema Integrado de Gestão de Comunidades Terapeuticas." },
    { name: "Sistema desenvolvido para o Departamento de Entidades de Acolhimento Atuantes em Álcool e Drogas", content: "Acesse o link para entrar" },
  ];
}

export default function DashboardCebas() {
    return <Cebas/>;
}
