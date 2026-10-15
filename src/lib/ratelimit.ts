import "server-only";
import { headers } from "next/headers";
import { supabase, usingSupabase } from "./store";

// Tentativas de login por IP. Cada tentativa é contada ANTES de conferir a senha,
// então várias requisições em paralelo não passam do limite.
export const LOGIN_MAX_ATTEMPTS = Number(process.env.LOGIN_MAX_ATTEMPTS) || 3;
export const LOGIN_WINDOW_SECONDS = Number(process.env.LOGIN_WINDOW_MINUTES || 15) * 60;

type Attempt = { allowed: boolean; retryAfter: number };

/** IP de quem fez a requisição. Na Vercel esses cabeçalhos são definidos pela própria plataforma. */
export async function clientIp() {
  const h = await headers();
  return h.get("x-real-ip") || h.get("x-forwarded-for")?.split(",")[0].trim() || "desconhecido";
}

// Modo local: um processo só, então a memória basta.
const memory = new Map<string, { count: number; resetAt: number }>();

function memoryAttempt(key: string): Attempt {
  const now = Date.now();
  if (memory.size > 5000) for (const [k, e] of memory) if (e.resetAt <= now) memory.delete(k);
  let entry = memory.get(key);
  if (!entry || entry.resetAt <= now) {
    entry = { count: 0, resetAt: now + LOGIN_WINDOW_SECONDS * 1000 };
    memory.set(key, entry);
  }
  entry.count++;
  return { allowed: entry.count <= LOGIN_MAX_ATTEMPTS, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
}

/** Registra uma tentativa de login e diz se ela pode prosseguir. */
export async function registerLoginAttempt(key: string): Promise<Attempt> {
  // No ar, cada instância tem sua própria memória e ela some a cada cold start:
  // o contador precisa ficar no banco, senão o limite não vale nada.
  if (!usingSupabase()) return memoryAttempt(key);
  const { data, error } = await supabase().rpc("register_login_attempt", {
    p_key: key,
    p_max: LOGIN_MAX_ATTEMPTS,
    p_window_seconds: LOGIN_WINDOW_SECONDS,
  });
  // Sem o contador, bloqueia em vez de liberar tentativas ilimitadas.
  if (error) throw new Error("Não foi possível verificar o limite de tentativas. Rode supabase/schema.sql de novo.");
  const row = Array.isArray(data) ? data[0] : data;
  return { allowed: Boolean(row?.allowed), retryAfter: Number(row?.retry_after) || 0 };
}

/** Zera o contador depois de um login certo. */
export async function clearLoginAttempts(key: string) {
  if (!usingSupabase()) {
    memory.delete(key);
    return;
  }
  await supabase().from("login_attempts").delete().eq("key", key);
}
