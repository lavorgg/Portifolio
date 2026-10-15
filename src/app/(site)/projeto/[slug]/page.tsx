import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { Cover } from "@/components/Cover";
import { FaceSync } from "@/components/face";
import { loadContent } from "@/lib/content";
import { AREA, coverOf, paragraphs, youtubeId } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

async function find(slug: string) {
  const { projects } = await loadContent();
  const list = projects.filter((p) => p.published);
  const project = list.find((p) => p.slug === slug);
  if (!project) return null;
  const same = list.filter((p) => p.area === project.area);
  const next = same[(same.indexOf(project) + 1) % same.length];
  return { project, next: next && next.id !== project.id ? next : null };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = await find((await params).slug);
  if (!found) return {};
  const img = coverOf(found.project);
  return {
    title: found.project.title,
    description: found.project.summary,
    openGraph: img ? { images: [img] } : undefined,
  };
}

const d = (i: number) => ({ "--i": i }) as CSSProperties;

export default async function ProjectPage({ params }: Props) {
  const found = await find((await params).slug);
  if (!found) notFound();
  const { project: p, next } = found;
  const area = AREA[p.area];
  const facts = [
    ["Cliente", p.client],
    ["Ano", p.year],
    ["Meu papel", p.role],
  ].filter(([, v]) => v);
  const gallery = p.media.filter((m) => m.url !== p.cover);

  return (
    <article className={`project project-${p.area}`}>
      <FaceSync face={p.area} />
      {/* aplica a cor da área antes da pintura quando a página é aberta direto */}
      <script dangerouslySetInnerHTML={{ __html: `document.documentElement.dataset.face=${JSON.stringify(p.area)}` }} />

      <header className="project-head">
        <Link href={area.path} className="back">
          <span className="arrow back-arrow">←</span> {area.title}
        </Link>
        <h1 className="h1" data-reveal>
          {p.title}
        </h1>
        {p.summary && (
          <p className="lede" data-reveal style={d(1)}>
            {p.summary}
          </p>
        )}
        <div className="project-actions" data-reveal style={d(2)}>
          {p.liveUrl && (
            <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="btn btn-solid btn-lg">
              {p.area === "dev" ? "Acessar o site" : "Ver a campanha"} <span className="arrow arrow-out">↗</span>
            </a>
          )}
          {p.repoUrl && (
            <a href={p.repoUrl} target="_blank" rel="noopener noreferrer" className="btn btn-quiet btn-lg">
              Ver o código <span className="arrow arrow-out">↗</span>
            </a>
          )}
        </div>
        {facts.length > 0 && (
          <dl className="facts" data-reveal style={d(3)}>
            {facts.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        )}
      </header>

      <div className="project-cover" data-reveal>
        <Cover project={p} priority />
      </div>

      {p.results.length > 0 && (
        <section className="results" aria-label="Resultados">
          {p.results.map((r, i) => (
            <div key={i} className="result" data-reveal style={d(i)}>
              <strong>{r.value}</strong>
              <span>{r.label}</span>
            </div>
          ))}
        </section>
      )}

      <section className="project-body">
        <div className="project-text">
          {paragraphs(p.description).map((t, i) => (
            <p key={i} data-reveal style={d(i)}>
              {t}
            </p>
          ))}
        </div>
        {p.tags.length > 0 && (
          <ul className="tags" data-reveal aria-label="Tecnologias e ferramentas">
            {p.tags.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        )}
      </section>

      {gallery.length > 0 && (
        <section className="gallery" aria-label="Galeria">
          {gallery.map((m, i) => {
            const yt = m.type === "youtube" ? youtubeId(m.url) : null;
            return (
              <figure key={m.id} className={`media media-${m.type}`} data-reveal style={d(i % 3)}>
                {m.type === "image" && (
                  <a href={m.url} target="_blank" rel="noopener noreferrer" aria-label="Abrir imagem em tamanho real">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={m.url} alt={m.caption || `Print do projeto ${p.title}`} loading="lazy" />
                  </a>
                )}
                {m.type === "video" && <video src={m.url} controls playsInline preload="metadata" />}
                {yt && (
                  <div className="yt">
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${yt}`}
                      title={m.caption || `Vídeo do projeto ${p.title}`}
                      allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                      loading="lazy"
                    />
                  </div>
                )}
                {m.caption && <figcaption>{m.caption}</figcaption>}
              </figure>
            );
          })}
        </section>
      )}

      {next && (
        <Link href={`/projeto/${next.slug}`} className="next" data-reveal>
          <span className="next-title">
            {next.title} <span className="arrow">→</span>
          </span>
          <span className="next-label">Próximo projeto</span>
        </Link>
      )}
    </article>
  );
}
