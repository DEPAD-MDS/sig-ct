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
      route("/support", "routes/dashboard.suporte.tsx"),
      route("/relator", "routes/dashboard.relator.tsx"),
      route("/comunidades", "./screens/dashboard/Comunidade.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
