import { configError, isAdmin } from "@/lib/auth";
import { getContent, usingSupabase } from "@/lib/store";
import { AdminApp } from "./AdminApp";
import { LoginForm } from "./LoginForm";

export default async function AdminPage() {
  const config = configError();
  if (config) {
    return (
      <main className="login">
        <div className="login-box">
          <h1>Painel não configurado</h1>
          <p className="error" role="alert">
            {config}
          </p>
          <p>Coloque o valor em .env.local (no seu computador) ou nas variáveis de ambiente da Vercel e reinicie o site.</p>
        </div>
      </main>
    );
  }
  if (!(await isAdmin())) return <LoginForm />;
  const content = await getContent();
  return <AdminApp initial={content} storage={usingSupabase() ? "supabase" : "local"} />;
}
