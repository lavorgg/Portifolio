import { promises as fs } from "node:fs";
import path from "node:path";
import { isAdmin } from "@/lib/auth";
import { UPLOAD_DIR, usingSupabase } from "@/lib/store";

// Upload do modo local. No ar, os arquivos vão direto do navegador para o Supabase.
export async function POST(req: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Sessão expirada." }, { status: 401 });
  if (usingSupabase() || process.env.VERCEL) {
    return Response.json({ error: "Upload local desativado neste ambiente." }, { status: 400 });
  }
  const form = await req.formData();
  const file = form.get("file");
  const name = String(form.get("name") ?? "");
  if (!(file instanceof File) || !/^[a-z0-9-]+(\.[a-z0-9]+)?$/.test(name)) {
    return Response.json({ error: "Arquivo inválido." }, { status: 400 });
  }
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, name), Buffer.from(await file.arrayBuffer()));
  return Response.json({ url: `/media/${name}` });
}
