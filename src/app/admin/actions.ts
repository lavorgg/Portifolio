"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { checkPassword, endSession, requireAdmin, startSession } from "@/lib/auth";
import { createUploadTarget, saveContent, type UploadTarget } from "@/lib/store";
import { contentSchema, type Content } from "@/lib/schema";

export async function loginAction(_prev: string | null, form: FormData): Promise<string | null> {
  const password = String(form.get("password") ?? "");
  if (!checkPassword(password)) {
    await new Promise((r) => setTimeout(r, 800)); // freia tentativas em sequência
    return "Senha incorreta.";
  }
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
