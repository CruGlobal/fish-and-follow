import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/login", "routes/login.tsx"),
  layout("./components/ProtectedRoute.tsx", [
    route("/qr", "routes/qr.tsx"),
    route("/contacts", "routes/contacts.tsx"),
    route("/admin", "routes/admin.tsx"),
    route("/bulkmessaging", "routes/bulkmessaging.tsx")
  ]),
  route("/resources", "routes/resources.tsx"),
] satisfies RouteConfig;
