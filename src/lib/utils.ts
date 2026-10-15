import type { Area, Project } from "./schema";

export function slugify(input: string) {
  return (
    input
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "projeto"
  );
}

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

export function youtubeId(url: string) {
  const m = url.match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/|\/live\/)([\w-]{11})/);
  return m ? m[1] : null;
}

export const AREA = {
  dev: { path: "/dev", label: "Programação", title: "Projetos de programação", live: "Abrir site" },
  mkt: { path: "/marketing", label: "Marketing", title: "Projetos de marketing", live: "Ver campanha" },
} satisfies Record<Area, { path: string; label: string; title: string; live: string }>;

export function otherArea(area: Area): Area {
  return area === "dev" ? "mkt" : "dev";
}

/** Capa do projeto: a capa escolhida ou o primeiro print. */
export function coverOf(p: Project) {
  return p.cover || p.media.find((m) => m.type === "image")?.url || "";
}

export function paragraphs(text: string) {
  return text
    .split(/\n\s*\n/)
    .map((t) => t.trim())
    .filter(Boolean);
}

export function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
