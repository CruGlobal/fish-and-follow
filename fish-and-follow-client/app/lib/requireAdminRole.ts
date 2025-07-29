import { redirect } from "react-router";
import { Roles } from "~/types/roles";

export async function requireAdminRole() {
  const response = await fetch("/auth/status", {
    credentials: "include",
  });
  const data = await response.json();
  if (data.user.role !== Roles.ADMIN) {
    throw redirect("/login");
  }
  return null;
}
