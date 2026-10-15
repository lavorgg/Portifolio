import { prepareUploadAction } from "./actions";

/** Envia um arquivo e devolve a URL pública. No ar, vai direto do navegador para o Supabase. */
export async function uploadFile(file: File): Promise<string> {
  const target = await prepareUploadAction(file.name);
  if (target.mode === "local") {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("name", target.name);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || "Falha no upload.");
    return json.url as string;
  }
  const fd = new FormData();
  fd.append("cacheControl", "31536000");
  fd.append("", file);
  const res = await fetch(target.signedUrl, { method: "PUT", body: fd, headers: { "x-upsert": "false" } });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Falha no upload (${res.status}). ${text.slice(0, 160)}`);
  }
  return target.publicUrl;
}
