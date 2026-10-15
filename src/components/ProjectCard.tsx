import Link from "next/link";
import type { CSSProperties } from "react";
import type { Project } from "@/lib/schema";
import { AREA } from "@/lib/utils";
import { Cover } from "./Cover";

export function ProjectCard({
  project,
  index = 0,
  size = "normal",
}: {
  project: Project;
  index?: number;
  size?: "wide" | "normal";
}) {
  const meta = [project.client, project.year].filter(Boolean).join(" · ");
  return (
    <article
      className={`card card-${size} card-${project.area}`}
      data-reveal
      style={{ "--i": index % 4 } as CSSProperties}
    >
      <Cover project={project} priority={index < 2} />
      <div className="card-body">
        <h3 className="card-title">
          <Link href={`/projeto/${project.slug}`} className="card-link">
            {project.title}
          </Link>
        </h3>
        {meta && <p className="card-meta">{meta}</p>}
        {project.summary && <p className="card-summary">{project.summary}</p>}
        {project.results[0] && (
          <p className="card-result">
            <strong>{project.results[0].value}</strong> {project.results[0].label}
          </p>
        )}
        <div className="card-actions">
          <span className="btn btn-quiet" aria-hidden="true">
            Ver projeto <span className="arrow">→</span>
          </span>
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="btn btn-solid card-live">
              {AREA[project.area].live} <span className="arrow arrow-out">↗</span>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
