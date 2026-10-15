import type { Project } from "@/lib/schema";
import { coverOf, hash } from "@/lib/utils";
import { Mark, MARK_NAMES } from "./Marks";

/** Capa do projeto. Sem imagem, desenha uma capa tipográfica com as marcas da área. */
export function Cover({ project, priority = false }: { project: Project; priority?: boolean }) {
  const src = coverOf(project);
  if (src) {
    return (
      <div className="cover">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={`Imagem do projeto ${project.title}`} loading={priority ? "eager" : "lazy"} />
      </div>
    );
  }
  const names = MARK_NAMES[project.area];
  const h = hash(project.slug);
  return (
    <div className={`cover cover-drawn cover-${project.area}`} data-variant={h % 3}>
      <Mark face={project.area} shape={names[h % names.length]} className="cover-mark a" />
      <Mark face={project.area} shape={names[(h >> 3) % names.length]} className="cover-mark b" />
      {project.results[0] ? (
        <span className="cover-stat" aria-hidden="true">
          <strong>{project.results[0].value}</strong>
          <span>{project.results[0].label}</span>
        </span>
      ) : (
        <span className="cover-stat" aria-hidden="true">
          <strong className="cover-tags">{project.tags.slice(0, 3).join(" · ") || project.title}</strong>
        </span>
      )}
    </div>
  );
}
