import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/contact-form", "routes/contact-form.tsx"),
  route("/login", "routes/login.tsx"),
  route("/qr", "routes/qr.tsx"),
  route("/contacts", "routes/contacts.tsx"),
  route("/admin", "routes/admin.tsx"),
  route("/bulkmessaging", "routes/bulkmessaging.tsx"),
  route("/resources", "routes/resources.tsx"),
] satisfies RouteConfig;
