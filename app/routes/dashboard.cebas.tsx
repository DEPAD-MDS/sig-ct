import type { Route } from "./+types/dashboard.repasses";
import Cebas from "~/dashboard/Cebas";
export function meta({}: Route.MetaArgs) {
  return [
    { title: "SIG-CT Documentação do Sistema" },
    { name: "Documentação do Sig-CT \n Consulte guias, endpoints e instruções detalhadas para integrar e utilizar todos os recursos do sistema SIG-CT com eficiência.", content: "Documentação técnica SIG-CT" },
  ];
}

export default function DashboardCebas() {
  return <Cebas />;
}
