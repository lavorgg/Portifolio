import { isAdmin } from "@/lib/auth";
import { getContent, usingSupabase } from "@/lib/store";
import { AdminApp } from "./AdminApp";
import { LoginForm } from "./LoginForm";

export default async function AdminPage() {
  if (!(await isAdmin())) return <LoginForm />;
  const content = await getContent();
  return <AdminApp initial={content} storage={usingSupabase() ? "supabase" : "local"} />;
}
