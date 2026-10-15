import Link from "next/link";
import type { CSSProperties } from "react";
import { CopyButton } from "@/components/CopyButton";
import { FaceSync } from "@/components/face";
import { Hero } from "@/components/Hero";
import { Mark } from "@/components/Marks";
import { ProjectCard } from "@/components/ProjectCard";
import { loadContent } from "@/lib/content";
import type { Area } from "@/lib/schema";
import { AREA, paragraphs } from "@/lib/utils";

const d = (i: number) => ({ "--i": i }) as CSSProperties;

export default async function Home() {
  const content = await loadContent();
  const { profile, techs, courses, experience, projects } = content;
  const published = projects.filter((p) => p.published);
  const featured = (area: Area) => {
    const list = published.filter((p) => p.area === area);
    const picked = list.filter((p) => p.featured);
    return (picked.length ? picked : list).slice(0, 2);
  };
  const whatsapp = profile.whatsapp.replace(/\D/g, "");
  const links = [
    profile.linkedin && { label: "LinkedIn", href: profile.linkedin },
    profile.github && { label: "GitHub", href: profile.github },
    profile.instagram && { label: "Instagram", href: profile.instagram },
    whatsapp && { label: "WhatsApp", href: `https://wa.me/${whatsapp}` },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <>
      <FaceSync />
      <Hero content={content} />

      <section id="sobre" className="story">
        <h2 className="h2" data-reveal>
          Como entrei na área
        </h2>
        <div className="story-text">
          {paragraphs(profile.story).map((p, i) => (
            <p key={i} data-reveal style={d(i)}>
              {p}
            </p>
          ))}
        </div>
        {experience.length > 0 && (
          <ol className="timeline">
            {experience.map((e, i) => (
              <li key={e.id} className={`tl-item tl-${e.area}`} data-reveal style={d(i)}>
                <span className="tl-period">{e.period}</span>
                <h3 className="tl-role">{e.role}</h3>
                <p className="tl-company">{e.company}</p>
                {e.description && <p className="tl-desc">{e.description}</p>}
              </li>
            ))}
          </ol>
        )}
      </section>

      <section id="ferramentas" className="tools">
        <h2 className="h2" data-reveal>
          O que eu uso no dia a dia
        </h2>
        <div className="tools-cols">
          {(["dev", "mkt"] as const).map((area, col) => (
            <div key={area} className={`tools-col tools-${area}`} data-reveal style={d(col)}>
              <Mark face={area} shape={area === "dev" ? "tag" : "spark"} className="tools-mark" />
              <h3 className="tools-title">{AREA[area].label}</h3>
              <ul className="tools-list">
                {techs
                  .filter((t) => t.area === area)
                  .map((t) => (
                    <li key={t.id}>{t.name}</li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section id="projetos" className="featured">
        <h2 className="h2" data-reveal>
          Alguns projetos
        </h2>
        {(["dev", "mkt"] as const).map((area) => {
          const list = featured(area);
          if (!list.length) return null;
          return (
            <div key={area} className="featured-group">
              <div className="featured-head" data-reveal>
                <h3 className="h3">{AREA[area].title}</h3>
                <Link href={AREA[area].path} className="btn btn-quiet">
                  Ver todos <span className="arrow">→</span>
                </Link>
              </div>
              <div className="featured-grid">
                {list.map((p, i) => (
                  <ProjectCard key={p.id} project={p} index={i} />
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {courses.length > 0 && (
        <section id="cursos" className="courses">
          <h2 className="h2" data-reveal>
            Cursos e certificados
          </h2>
          <ul className="course-list">
            {courses.map((c, i) => (
              <li key={c.id} className="course" data-reveal style={d(i)}>
                <span className="course-year">{c.year}</span>
                <span className="course-title">
                  {c.url ? (
                    <a href={c.url} target="_blank" rel="noopener noreferrer">
                      {c.title} ↗
                    </a>
                  ) : (
                    c.title
                  )}
                </span>
                <span className="course-school">{c.school}</span>
                <span className={`course-area course-area-${c.area}`}>{AREA[c.area].label}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section id="contato" className="contact">
        <h2 className="h2" data-reveal>
          Vamos conversar?
        </h2>
        <p className="contact-lede" data-reveal style={d(1)}>
          {profile.available
            ? "Estou aceitando novos projetos e oportunidades. Respondo em até um dia útil."
            : "No momento estou com a agenda cheia, mas pode mandar sua mensagem."}
        </p>
        {profile.email && (
          <div className="contact-mail" data-reveal style={d(2)}>
            <a href={`mailto:${profile.email}`} className="mail">
              {profile.email}
            </a>
            <CopyButton text={profile.email} label="Copiar e-mail" />
          </div>
        )}
        <div className="contact-links" data-reveal style={d(3)}>
          {links.map((l) => (
            <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="btn btn-quiet">
              {l.label} <span className="arrow arrow-out">↗</span>
            </a>
          ))}
          {profile.phone && <span className="contact-phone">{profile.phone}</span>}
          {profile.cvUrl && (
            <a href={profile.cvUrl} target="_blank" rel="noopener noreferrer" className="btn btn-solid">
              Baixar currículo
            </a>
          )}
        </div>
      </section>
    </>
  );
}
