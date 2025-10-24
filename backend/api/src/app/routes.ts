import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/auth.login.tsx"),
  layout("components/DashboardLayout.tsx", [
    ...prefix("dashboard", [
      route("/", "routes/dashboard.tsx"),
      route("/repasses", "routes/dashboard.repasses.tsx"),
      route("/cebas", "routes/dashboard.cebas.tsx"),
      route("/monitoramento", "routes/dashboard.monitoramento.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
