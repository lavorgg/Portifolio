"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Content } from "@/lib/schema";
import { useFace } from "./face";

/**
 * O "lado" que o visitante escolhe muda o site inteiro de cor e troca o cartão do hero:
 * no Dev ele vira código, no Marketing ele vira um briefing.
 */
export function Hero({ content }: { content: Content }) {
  const { profile, techs } = content;
  const { face, setFace } = useFace();
  const dev = techs.filter((t) => t.area === "dev").slice(0, 3).map((t) => t.name);
  const mkt = techs.filter((t) => t.area === "mkt").slice(0, 3).map((t) => t.name);
  const projectsHref = face === "mkt" ? "/marketing" : "/dev";

  return (
    <section className="hero">
      <div className="hero-text">
        <h1 className="hero-name" data-reveal>
          {profile.name}
        </h1>
        <p className="hero-role" data-reveal style={{ "--i": 1 } as React.CSSProperties}>
          {profile.headline}
        </p>
        <p className="hero-intro" data-reveal style={{ "--i": 2 } as React.CSSProperties}>
          {profile.intro}
        </p>
        <div className="hero-actions" data-reveal style={{ "--i": 3 } as React.CSSProperties}>
          <Link href={projectsHref} className="btn btn-solid btn-lg">
            Ver projetos de {face === "mkt" ? "marketing" : "programação"} <span className="arrow">→</span>
          </Link>
          <a href="#contato" className="btn btn-quiet btn-lg">
            Falar comigo
          </a>
        </div>
      </div>

      <div className="hero-side" data-reveal style={{ "--i": 2 } as React.CSSProperties}>
        <div className="side-switch" role="group" aria-label="Escolha um lado">
          <span>Ver meu lado</span>
          <button type="button" aria-pressed={face === "dev"} onClick={() => setFace("dev", true)}>
            Dev
          </button>
          <button type="button" aria-pressed={face === "mkt"} onClick={() => setFace("mkt", true)}>
            Marketing
          </button>
        </div>
        <div className="hero-cards">
          <CodeCard active={face === "dev"} name={profile.name} stack={dev} available={profile.available} />
          <BriefCard active={face === "mkt"} profile={profile} channels={mkt} />
        </div>
      </div>
    </section>
  );
}

function CodeCard({ active, name, stack, available }: { active: boolean; name: string; stack: string[]; available: boolean }) {
  const lines = [
    "const eu = {",
    `  nome: "${name}",`,
    `  stack: [${stack.map((s) => `"${s}"`).join(", ")}],`,
    `  foco: "sites que viram clientes",`,
    `  disponivel: ${available},`,
    "};",
  ];
  const full = lines.join("\n");
  const [shown, setShown] = useState(full.length);
  const [ready, setReady] = useState(false);
  const played = useRef(false);

  useEffect(() => setReady(true), []);

  useEffect(() => {
    if (!active || played.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      played.current = true;
      return;
    }
    let n = 0;
    setShown(0);
    const id = setInterval(() => {
      n += 2;
      setShown(Math.min(n, full.length));
      if (n >= full.length) {
        clearInterval(id);
        played.current = true;
      }
    }, 22);
    // se for interrompido no meio, mostra o código inteiro (e deixa tentar de novo)
    return () => {
      clearInterval(id);
      if (!played.current) setShown(full.length);
    };
  }, [active, full.length]);

  return (
    <div className={`hero-card code-card${active ? " is-active" : ""}${ready ? " ready" : ""}`} aria-hidden={!active}>
      <div className="code-top">
        <span>eu.ts</span>
      </div>
      <pre>
        <code>
          {highlight(full.slice(0, shown))}
          <span className="caret" />
        </code>
      </pre>
    </div>
  );
}

/** Realce simples: strings, palavras-chave e booleanos. */
function highlight(src: string) {
  const parts = src.split(/("[^"\n]*"?|\bconst\b|\btrue\b|\bfalse\b)/g);
  return parts.map((p, i) => {
    if (!p) return null;
    if (p.startsWith('"')) return <span key={i} className="tk-str">{p}</span>;
    if (p === "const") return <span key={i} className="tk-kw">{p}</span>;
    if (p === "true" || p === "false") return <span key={i} className="tk-bool">{p}</span>;
    return p;
  });
}

function BriefCard({ active, profile, channels }: { active: boolean; profile: Content["profile"]; channels: string[] }) {
  return (
    <div className={`hero-card brief-card${active ? " is-active" : ""}`} aria-hidden={!active}>
      <span className="tape" aria-hidden="true" />
      <p className="brief-title">Briefing</p>
      <dl>
        <div>
          <dt>Quem</dt>
          <dd>{profile.name}</dd>
        </div>
        <div>
          <dt>Objetivo</dt>
          <dd>Levar mais clientes até o seu negócio</dd>
        </div>
        <div>
          <dt>Canais</dt>
          <dd>{channels.join(", ") || "Redes sociais e anúncios"}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{profile.available ? "Aceitando novos projetos" : "Agenda cheia no momento"}</dd>
        </div>
      </dl>
    </div>
  );
}
