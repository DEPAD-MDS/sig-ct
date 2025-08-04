import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/dashboard.geral.tsx"),
    route("/login", "routes/login.tsx")
] satisfies RouteConfig;
