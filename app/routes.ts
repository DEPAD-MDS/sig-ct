import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
    layout("../components/navigation/dashboard/DesktopNavigation.tsx", [
    index("routes/dashboard.geral.tsx"),
    route("/repasses", "routes/dashboard.repasses.tsx"),
    route("/cebas", "routes/dashboard.cebas.tsx"),
  ]),
    route("/login", "routes/login.tsx"),
    route("/publicdoc", "routes/login.documentation.tsx")
] satisfies RouteConfig;
