import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import seed from "../../data/seed.json";
import { contentSchema, type Content } from "./schema";

const DATA_DIR = path.join(process.cwd(), "data");
const LOCAL_FILE = path.join(DATA_DIR, "content.local.json");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");
const BUCKET = process.env.SUPABASE_BUCKET || "media";

let client: SupabaseClient | null = null;

export function usingSupabase() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function supabase() {
  if (!client) {
    client = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

function parse(raw: unknown): Content {
  const result = contentSchema.safeParse(raw);
  return result.success ? result.data : contentSchema.parse(seed);
}

export async function getContent(): Promise<Content> {
  if (usingSupabase()) {
    const { data, error } = await supabase().from("site_content").select("data").eq("id", 1).maybeSingle();
    if (error) throw new Error(`Supabase: ${error.message}`);
    return parse(data?.data ?? seed);
  }
  try {
    return parse(JSON.parse(await fs.readFile(LOCAL_FILE, "utf8")));
  } catch {
    return parse(seed);
  }
}

export async function saveContent(content: Content) {
  const valid = contentSchema.parse(content);
  if (usingSupabase()) {
    const { error } = await supabase()
      .from("site_content")
      .upsert({ id: 1, data: valid, updated_at: new Date().toISOString() });
    if (error) throw new Error(`Supabase: ${error.message}`);
    return;
  }
  if (process.env.VERCEL) {
    throw new Error("No ar, o site precisa do Supabase para salvar. Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.");
  }
  await fs.writeFile(LOCAL_FILE, JSON.stringify(valid, null, 2), "utf8");
}

function safeName(filename: string) {
  const ext = path.extname(filename).toLowerCase().replace(/[^a-z0-9.]/g, "").slice(0, 8);
  const base = path
    .basename(filename, path.extname(filename))
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return `${Date.now().toString(36)}-${base || "arquivo"}${ext}`;
}

export type UploadTarget =
  | { mode: "local"; name: string }
  | { mode: "supabase"; signedUrl: string; publicUrl: string };

export async function createUploadTarget(filename: string): Promise<UploadTarget> {
  const name = safeName(filename);
  if (!usingSupabase()) return { mode: "local", name };
  const storage = supabase().storage.from(BUCKET);
  const { data, error } = await storage.createSignedUploadUrl(name);
  if (error || !data) throw new Error(`Supabase: ${error?.message ?? "falha ao preparar upload"}`);
  return { mode: "supabase", signedUrl: data.signedUrl, publicUrl: storage.getPublicUrl(name).data.publicUrl };
}
