"use server";

import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { checkPassword, configError, endSession, requireAdmin, startSession } from "@/lib/auth";
import { CONTENT_TAG } from "@/lib/content";
import { clearLoginAttempts, clientIp, registerLoginAttempt } from "@/lib/ratelimit";
import { createUploadTarget, saveContent, type UploadTarget } from "@/lib/store";
import { contentSchema, type Content } from "@/lib/schema";

function minutes(seconds: number) {
  const m = Math.max(1, Math.ceil(seconds / 60));
  return m === 1 ? "1 minuto" : `${m} minutos`;
}

export async function loginAction(_prev: string | null, form: FormData): Promise<string | null> {
  const config = configError();
  if (config) return config;
  const password = String(form.get("password") ?? "").slice(0, 200);
  const key = `login:${await clientIp()}`;
  let attempt;
  try {
    attempt = await registerLoginAttempt(key);
  } catch (e) {
    return e instanceof Error ? e.message : "Não foi possível entrar agora.";
  }
  if (!attempt.allowed) {
    return `Muitas tentativas. Tente de novo em ${minutes(attempt.retryAfter)}.`;
  }
  if (!checkPassword(password)) return "Senha incorreta.";
  await clearLoginAttempts(key);
  await startSession();
  redirect("/admin");
}

export async function logoutAction() {
  await endSession();
  redirect("/admin");
}

export async function saveAction(content: Content): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await requireAdmin();
    const parsed = contentSchema.safeParse(content);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return { ok: false, error: `Campo inválido em ${issue.path.join(" › ")}: ${issue.message}` };
    }
    const slugs = new Set<string>();
    for (const p of parsed.data.projects) {
      if (slugs.has(p.slug)) return { ok: false, error: `Dois projetos usam o endereço "${p.slug}". Mude um deles.` };
      slugs.add(p.slug);
    }
    await saveContent(parsed.data);
    updateTag(CONTENT_TAG);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Não foi possível salvar." };
  }
}

export async function prepareUploadAction(filename: string): Promise<UploadTarget> {
  await requireAdmin();
  return createUploadTarget(filename);
}
