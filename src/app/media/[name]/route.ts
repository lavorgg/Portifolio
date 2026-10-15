import { promises as fs } from "node:fs";
import path from "node:path";
import { UPLOAD_DIR } from "@/lib/store";

const TYPES: Record<string, string> = {
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp",
  ".gif": "image/gif", ".avif": "image/avif", ".svg": "image/svg+xml",
  ".mp4": "video/mp4", ".webm": "video/webm", ".mov": "video/quicktime", ".pdf": "application/pdf",
};

// Serve os arquivos enviados no modo local (data/uploads).
export async function GET(req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  if (!/^[a-z0-9-]+(\.[a-z0-9]+)?$/.test(name)) return new Response("Não encontrado", { status: 404 });
  let buf: Buffer;
  try {
    buf = await fs.readFile(path.join(UPLOAD_DIR, name));
  } catch {
    return new Response("Não encontrado", { status: 404 });
  }
  const type = TYPES[path.extname(name)] ?? "application/octet-stream";
  const headers: Record<string, string> = {
    "Content-Type": type,
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=31536000, immutable",
  };
  if (type === "image/svg+xml") headers["Content-Security-Policy"] = "script-src 'none'";

  // vídeos precisam de Range para o navegador conseguir avançar
  const range = req.headers.get("range")?.match(/bytes=(\d*)-(\d*)/);
  if (range) {
    const start = range[1] ? Number(range[1]) : 0;
    const end = range[2] ? Math.min(Number(range[2]), buf.length - 1) : buf.length - 1;
    if (start > end || start >= buf.length) {
      return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${buf.length}` } });
    }
    return new Response(new Uint8Array(buf.subarray(start, end + 1)), {
      status: 206,
      headers: { ...headers, "Content-Range": `bytes ${start}-${end}/${buf.length}`, "Content-Length": String(end - start + 1) },
    });
  }
  return new Response(new Uint8Array(buf), { headers: { ...headers, "Content-Length": String(buf.length) } });
}
