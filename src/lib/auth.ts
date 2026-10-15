import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "admin_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 dias
const MIN_PASSWORD = 12;
const MIN_SECRET = 32;

/** O que falta configurar para o painel funcionar, ou null se está tudo certo. */
export function configError(): string | null {
  const password = process.env.ADMIN_PASSWORD ?? "";
  const secret = process.env.SESSION_SECRET ?? "";
  if (password.length < MIN_PASSWORD) return `Defina ADMIN_PASSWORD com pelo menos ${MIN_PASSWORD} caracteres.`;
  if (secret.length < MIN_SECRET) return `Defina SESSION_SECRET com pelo menos ${MIN_SECRET} caracteres (ex.: openssl rand -hex 32).`;
  return null;
}

function assertConfigured() {
  const error = configError();
  if (error) throw new Error(error);
}

function sign(value: string) {
  return createHmac("sha256", process.env.SESSION_SECRET!).update(value).digest("hex");
}

// Entra na assinatura da sessão: trocar ADMIN_PASSWORD derruba todas as sessões abertas.
function passwordTag() {
  return sign(`password:${process.env.ADMIN_PASSWORD}`).slice(0, 16);
}

function sessionSignature(exp: string) {
  return sign(`session:${exp}:${passwordTag()}`);
}

function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export function checkPassword(input: string) {
  assertConfigured();
  // compara os hashes para não vazar o tamanho da senha
  return safeEqual(sign(`check:${input}`), sign(`check:${process.env.ADMIN_PASSWORD}`));
}

export async function startSession() {
  assertConfigured();
  const exp = String(Math.floor(Date.now() / 1000) + MAX_AGE);
  (await cookies()).set(COOKIE, `${exp}.${sessionSignature(exp)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin() {
  if (configError()) return false;
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return false;
  const [exp, sig] = raw.split(".");
  if (!exp || !sig || !safeEqual(sig, sessionSignature(exp))) return false;
  return Number(exp) > Date.now() / 1000;
}

export async function requireAdmin() {
  if (!(await isAdmin())) throw new Error("Sessão expirada. Entre de novo.");
}
