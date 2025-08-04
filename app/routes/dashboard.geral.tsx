import type { Route } from "./+types/dashboard.geral";
import DashboardGeral from "~/dashboard/Geral";
import ProtectedRoute from "components/auth/ProtectedRoute";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "SIG-CT Acesso ao sistema" },
    {
      name: "Acesse o Sig-CT \n Entre no sistema Sig-CT para gerenciar e acompanhar todas as atividades de comunidades terapêuticas. Seu ambiente seguro, simples e direto para acesso às informações essenciais.",
      content: "Autenticação SIG-CT",
    },
  ];
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardGeral />;
    </ProtectedRoute>
  );
}
