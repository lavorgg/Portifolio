import Link from "next/link";
import { FaceSync } from "./face";
import { ProjectGrid } from "./ProjectGrid";
import { ProjectCard } from "./ProjectCard";
import { loadContent } from "@/lib/content";
import type { Area } from "@/lib/schema";
import { AREA, otherArea } from "@/lib/utils";

const INTRO: Record<Area, string> = {
  dev: "Sites, sistemas e automações que construí. Cada projeto tem prints, vídeo quando existe e o link para você testar.",
  mkt: "Campanhas e conteúdos que fiz com empresas, com o que foi feito e os resultados que trouxeram.",
};

export async function ProjectsView({ area }: { area: Area }) {
  const { projects } = await loadContent();
  const list = projects.filter((p) => p.area === area && p.published);
  const other = otherArea(area);
  const tags = Array.from(new Set(list.flatMap((p) => p.tags))).slice(0, 12);

  return (
    <>
      <FaceSync face={area} />
      <section className="projects">
        <div className="projects-head">
          <h1 className="h1" data-reveal>
            {AREA[area].title}
          </h1>
          <p className="lede" data-reveal style={{ "--i": 1 } as React.CSSProperties}>
            {INTRO[area]}
          </p>
        </div>
        {list.length ? (
          <ProjectGrid tags={tags} items={list.map((p) => ({ id: p.id, tags: p.tags }))}>
            {list.map((p, i) => (
              <ProjectCard key={p.id} project={p} index={i} size={i === 0 ? "wide" : "normal"} />
            ))}
          </ProjectGrid>
        ) : (
          <p className="empty">Os projetos desta área estão chegando. Volte em breve.</p>
        )}
      </section>

      <section className="crossover" data-reveal>
        <p>Também trabalho com {other === "mkt" ? "marketing" : "programação"}.</p>
        <Link href={AREA[other].path} className="crossover-link">
          {AREA[other].title} <span className="arrow">→</span>
        </Link>
      </section>
    </>
  );
}
