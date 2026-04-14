import { redirect } from "next/navigation";
import { isAuthenticated } from "../actions";
import AdminShell from "./AdminShell";

export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const authed = await isAuthenticated();
  if (!authed) redirect("/admin/login");

  return <AdminShell>{children}</AdminShell>;
}
