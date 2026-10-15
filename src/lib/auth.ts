import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "admin_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 dias

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) throw new Error("Defina SESSION_SECRET (16+ caracteres) nas variáveis de ambiente.");
  return s;
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export function checkPassword(input: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) throw new Error("Defina ADMIN_PASSWORD nas variáveis de ambiente.");
  // compara os hashes para não vazar o tamanho da senha
  return safeEqual(sign(input), sign(expected));
}

export async function startSession() {
  const exp = String(Math.floor(Date.now() / 1000) + MAX_AGE);
  (await cookies()).set(COOKIE, `${exp}.${sign(exp)}`, {
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
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return false;
  const [exp, sig] = raw.split(".");
  if (!exp || !sig || !safeEqual(sig, sign(exp))) return false;
  return Number(exp) > Date.now() / 1000;
}

export async function requireAdmin() {
  if (!(await isAdmin())) throw new Error("Sessão expirada. Entre de novo.");
}
