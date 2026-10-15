"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Area, Content, Media, Project } from "@/lib/schema";
import { AREA, slugify, uid, youtubeId } from "@/lib/utils";
import { logoutAction, saveAction } from "./actions";
import { uploadFile } from "./upload";

type Tab = "projetos" | "perfil" | "ferramentas" | "cursos" | "experiencia";
const TABS: [Tab, string][] = [
  ["projetos", "Projetos"],
  ["perfil", "Sobre e contato"],
  ["ferramentas", "Tecnologias"],
  ["cursos", "Cursos"],
  ["experiencia", "Experiência"],
];

export function AdminApp({ initial, storage }: { initial: Content; storage: "local" | "supabase" }) {
  const [content, setContent] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [tab, setTab] = useState<Tab>("projetos");
  const [status, setStatus] = useState<{ kind: "ok" | "error" | "busy"; text: string } | null>(null);
  const dirty = content !== saved;

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  async function save() {
    setStatus({ kind: "busy", text: "Salvando…" });
    const res = await saveAction(content);
    if (res.ok) {
      setSaved(content);
      setStatus({ kind: "ok", text: "Salvo. O site já mostra as mudanças." });
    } else {
      setStatus({ kind: "error", text: res.error });
    }
  }

  const set = <K extends keyof Content>(key: K, value: Content[K]) => {
    setContent((c) => ({ ...c, [key]: value }));
    setStatus(null);
  };

  return (
    <div className="app">
      <header className="topbar">
        <strong>Painel do portfólio</strong>
        <div className="topbar-actions">
          <a href="/" target="_blank" rel="noopener noreferrer" className="a-btn ghost">
            Ver site ↗
          </a>
          <form action={logoutAction}>
            <button className="a-btn ghost">Sair</button>
          </form>
        </div>
      </header>

      {storage === "local" && (
        <p className="notice">
          Modo local: as alterações ficam em <code>data/content.local.json</code> e os arquivos em{" "}
          <code>data/uploads</code>. No ar, tudo fica no Supabase.
        </p>
      )}

      <nav className="tabs" aria-label="Seções do painel">
        {TABS.map(([id, label]) => (
          <button key={id} type="button" aria-current={tab === id} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </nav>

      <main className="panel">
        {tab === "projetos" && <ProjectsEditor projects={content.projects} onChange={(v) => set("projects", v)} />}
        {tab === "perfil" && <ProfileEditor profile={content.profile} onChange={(v) => set("profile", v)} />}
        {tab === "ferramentas" && (
          <ListEditor
            title="Tecnologias e ferramentas"
            hint="Aparecem na página inicial, separadas por área."
            items={content.techs}
            onChange={(v) => set("techs", v)}
            blank={() => ({ id: uid(), name: "", area: "dev" as Area })}
            fields={[
              { key: "name", label: "Nome", wide: true },
              { key: "area", label: "Área", kind: "area" },
            ]}
          />
        )}
        {tab === "cursos" && (
          <ListEditor
            title="Cursos e certificados"
            items={content.courses}
            onChange={(v) => set("courses", v)}
            blank={() => ({ id: uid(), title: "", school: "", year: "", area: "dev" as Area, url: "" })}
            fields={[
              { key: "title", label: "Curso", wide: true },
              { key: "school", label: "Escola ou plataforma" },
              { key: "year", label: "Ano" },
              { key: "area", label: "Área", kind: "area" },
              { key: "url", label: "Link do certificado", wide: true },
            ]}
          />
        )}
        {tab === "experiencia" && (
          <ListEditor
            title="Experiência"
            hint="Aparece na linha do tempo de “Como entrei na área”, na ordem desta lista."
            items={content.experience}
            onChange={(v) => set("experience", v)}
            blank={() => ({ id: uid(), role: "", company: "", period: "", description: "", area: "dev" as Area })}
            fields={[
              { key: "role", label: "Cargo ou função", wide: true },
              { key: "company", label: "Empresa" },
              { key: "period", label: "Período" },
              { key: "area", label: "Área", kind: "area" },
              { key: "description", label: "O que você fazia", kind: "textarea", wide: true },
            ]}
          />
        )}
      </main>

      <div className={`savebar${dirty || status ? " show" : ""}`} role="status">
        <span className={status?.kind === "error" ? "error" : undefined}>
          {status?.text ?? (dirty ? "Você tem alterações não salvas." : "")}
        </span>
        {dirty && (
          <div className="savebar-actions">
            <button type="button" className="a-btn ghost" onClick={() => (setContent(saved), setStatus(null))}>
              Descartar
            </button>
            <button type="button" className="a-btn primary" onClick={save} disabled={status?.kind === "busy"}>
              Salvar alterações
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- projetos ---------------- */

function newProject(area: Area, existing: Project[]): Project {
  const base = area === "dev" ? "novo-projeto-dev" : "novo-projeto-marketing";
  let slug = base;
  for (let n = 2; existing.some((p) => p.slug === slug); n++) slug = `${base}-${n}`;
  return {
    id: uid(), slug, area, title: "Novo projeto", client: "", year: String(new Date().getFullYear()), role: "",
    summary: "", description: "", tags: [], liveUrl: "", repoUrl: "", cover: "", media: [], results: [],
    featured: false, published: false,
  };
}

function ProjectsEditor({ projects, onChange }: { projects: Project[]; onChange: (p: Project[]) => void }) {
  const [filter, setFilter] = useState<Area | "all">("all");
  const [selected, setSelected] = useState<string | null>(projects[0]?.id ?? null);
  const current = projects.find((p) => p.id === selected) ?? null;
  const visible = projects.filter((p) => filter === "all" || p.area === filter);

  const update = (p: Project) => onChange(projects.map((x) => (x.id === p.id ? p : x)));
  const move = (id: string, dir: -1 | 1) => {
    const i = projects.findIndex((p) => p.id === id);
    const j = i + dir;
    if (j < 0 || j >= projects.length) return;
    const next = [...projects];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const add = (area: Area) => {
    const p = newProject(area, projects);
    onChange([p, ...projects]);
    setSelected(p.id);
  };
  const remove = (id: string) => {
    const next = projects.filter((p) => p.id !== id);
    onChange(next);
    setSelected(next[0]?.id ?? null);
  };

  return (
    <div className="projects">
      <aside className="plist">
        <div className="plist-head">
          <button type="button" className="a-btn primary" onClick={() => add("dev")}>
            + Projeto de programação
          </button>
          <button type="button" className="a-btn" onClick={() => add("mkt")}>
            + Projeto de marketing
          </button>
        </div>
        <div className="seg" role="group" aria-label="Filtrar lista">
          {(["all", "dev", "mkt"] as const).map((f) => (
            <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)}>
              {f === "all" ? "Todos" : AREA[f].label}
            </button>
          ))}
        </div>
        <ul>
          {visible.map((p) => (
            <li key={p.id} className={p.id === selected ? "on" : undefined}>
              <button type="button" className="prow" onClick={() => setSelected(p.id)}>
                <span className="prow-title">{p.title || "Sem título"}</span>
                <span className="prow-meta">
                  <span className={`chip chip-${p.area}`}>{AREA[p.area].label}</span>
                  <span className={`chip ${p.published ? "chip-ok" : "chip-draft"}`}>
                    {p.published ? "Publicado" : "Rascunho"}
                  </span>
                  {p.sample && <span className="chip">Exemplo</span>}
                </span>
              </button>
              <span className="prow-order">
                <button type="button" aria-label={`Subir ${p.title}`} onClick={() => move(p.id, -1)}>
                  ↑
                </button>
                <button type="button" aria-label={`Descer ${p.title}`} onClick={() => move(p.id, 1)}>
                  ↓
                </button>
              </span>
            </li>
          ))}
        </ul>
      </aside>
      {current ? (
        <ProjectForm key={current.id} project={current} all={projects} onChange={update} onRemove={() => remove(current.id)} />
      ) : (
        <div className="pempty">Crie seu primeiro projeto com os botões ao lado.</div>
      )}
    </div>
  );
}

function ProjectForm({
  project: p,
  all,
  onChange,
  onRemove,
}: {
  project: Project;
  all: Project[];
  onChange: (p: Project) => void;
  onRemove: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [slugTouched, setSlugTouched] = useState(!p.slug.startsWith("novo-projeto"));
  const set = <K extends keyof Project>(key: K, value: Project[K]) => onChange({ ...p, [key]: value, sample: false });
  const slugTaken = all.some((x) => x.id !== p.id && x.slug === p.slug);

  return (
    <section className="pform">
      <div className="pform-head">
        <h2>{p.title || "Sem título"}</h2>
        {p.published && (
          <a href={`/projeto/${p.slug}`} target="_blank" rel="noopener noreferrer" className="a-btn ghost">
            Abrir página ↗
          </a>
        )}
      </div>

      <div className="grid">
        <Field label="Título" wide>
          <input
            value={p.title}
            onChange={(e) => {
              const title = e.target.value;
              onChange({ ...p, title, sample: false, slug: slugTouched ? p.slug : slugify(title) });
            }}
          />
        </Field>
        <Field label="Área">
          <AreaSelect value={p.area} onChange={(v) => set("area", v)} />
        </Field>
        <Field label="Endereço da página" hint={slugTaken ? "Outro projeto já usa este endereço." : `/projeto/${p.slug}`}>
          <input
            value={p.slug}
            aria-invalid={slugTaken}
            onChange={(e) => {
              setSlugTouched(true);
              set("slug", slugify(e.target.value));
            }}
          />
        </Field>
        <Field label="Empresa ou cliente">
          <input value={p.client} onChange={(e) => set("client", e.target.value)} />
        </Field>
        <Field label="Ano">
          <input value={p.year} onChange={(e) => set("year", e.target.value)} />
        </Field>
        <Field label="Seu papel" wide>
          <input value={p.role} placeholder="Ex.: Desenvolvimento completo" onChange={(e) => set("role", e.target.value)} />
        </Field>
        <Field label="Resumo (aparece no card)" wide>
          <textarea rows={2} value={p.summary} maxLength={280} onChange={(e) => set("summary", e.target.value)} />
        </Field>
        <Field label="Descrição completa" hint="Deixe uma linha em branco para separar parágrafos." wide>
          <textarea rows={6} value={p.description} onChange={(e) => set("description", e.target.value)} />
        </Field>
        <Field label={p.area === "dev" ? "Link do site no ar" : "Link da campanha ou publicação"} wide>
          <input type="url" value={p.liveUrl} placeholder="https://" onChange={(e) => set("liveUrl", e.target.value.trim())} />
        </Field>
        {p.area === "dev" && (
          <Field label="Link do código (GitHub)" wide>
            <input type="url" value={p.repoUrl} placeholder="https://github.com/..." onChange={(e) => set("repoUrl", e.target.value.trim())} />
          </Field>
        )}
        <Field label={p.area === "dev" ? "Tecnologias" : "Ferramentas e canais"} hint="Separe por vírgula." wide>
          <TagsInput value={p.tags} onChange={(v) => set("tags", v)} />
        </Field>
      </div>

      <h3>Resultados</h3>
      <p className="hint">Números que mostram o impacto. Ex.: “+38%” e “leads no mês”.</p>
      <div className="results-edit">
        {p.results.map((r, i) => (
          <div key={i} className="row2">
            <input
              aria-label="Número"
              value={r.value}
              placeholder="+38%"
              onChange={(e) => set("results", p.results.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))}
            />
            <input
              aria-label="Descrição"
              value={r.label}
              placeholder="leads no mês"
              onChange={(e) => set("results", p.results.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
            />
            <button type="button" className="a-btn ghost" onClick={() => set("results", p.results.filter((_, j) => j !== i))}>
              Remover
            </button>
          </div>
        ))}
        {p.results.length < 6 && (
          <button type="button" className="a-btn" onClick={() => set("results", [...p.results, { value: "", label: "" }])}>
            + Adicionar resultado
          </button>
        )}
      </div>

      <h3>Prints e vídeos</h3>
      <MediaManager project={p} onChange={(media, cover) => onChange({ ...p, media, cover, sample: false })} />

      <div className="toggles">
        <label className="check">
          <input type="checkbox" checked={p.published} onChange={(e) => set("published", e.target.checked)} />
          Publicado (aparece no site)
        </label>
        <label className="check">
          <input type="checkbox" checked={p.featured} onChange={(e) => set("featured", e.target.checked)} />
          Destaque na página inicial
        </label>
      </div>

      <div className="danger">
        {confirmDelete ? (
          <>
            <span>Excluir “{p.title}”? Isso só vale depois de salvar.</span>
            <button type="button" className="a-btn danger-btn" onClick={onRemove}>
              Sim, excluir
            </button>
            <button type="button" className="a-btn ghost" onClick={() => setConfirmDelete(false)}>
              Cancelar
            </button>
          </>
        ) : (
          <button type="button" className="a-btn ghost" onClick={() => setConfirmDelete(true)}>
            Excluir projeto
          </button>
        )}
      </div>
    </section>
  );
}

function MediaManager({ project: p, onChange }: { project: Project; onChange: (media: Media[], cover: string) => void }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [yt, setYt] = useState("");
  const input = useRef<HTMLInputElement>(null);

  async function addFiles(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    let media = p.media;
    let cover = p.cover;
    for (const [i, file] of Array.from(files).entries()) {
      setBusy(`Enviando ${i + 1} de ${files.length}: ${file.name}`);
      try {
        const url = await uploadFile(file);
        const type = file.type.startsWith("video/") ? "video" : "image";
        media = [...media, { id: uid(), type, url, caption: "" }];
        if (!cover && type === "image") cover = url;
        onChange(media, cover);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Falha no upload.");
      }
    }
    setBusy(null);
    if (input.current) input.current.value = "";
  }

  function addYoutube() {
    if (!youtubeId(yt)) return setError("Esse link não parece ser do YouTube.");
    setError(null);
    onChange([...p.media, { id: uid(), type: "youtube", url: yt.trim(), caption: "" }], p.cover);
    setYt("");
  }

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= p.media.length) return;
    const next = [...p.media];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next, p.cover);
  };

  return (
    <div className="media-edit">
      <div
        className="drop"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          addFiles(e.dataTransfer.files);
        }}
      >
        <p>Arraste prints e vídeos para cá, ou</p>
        <label className="a-btn">
          Escolher arquivos
          <input
            ref={input}
            type="file"
            accept="image/*,video/mp4,video/webm,video/quicktime"
            multiple
            hidden
            onChange={(e) => addFiles(e.target.files)}
          />
        </label>
        <p className="hint">Vídeos grandes ficam melhores no YouTube (pode ser “não listado”).</p>
      </div>
      <div className="row2">
        <input value={yt} placeholder="Cole um link do YouTube" aria-label="Link do YouTube" onChange={(e) => setYt(e.target.value)} />
        <button type="button" className="a-btn" onClick={addYoutube} disabled={!yt}>
          Adicionar vídeo
        </button>
      </div>
      {busy && <p className="hint">{busy}</p>}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {p.media.length > 0 && (
        <ul className="media-list">
          {p.media.map((m, i) => (
            <li key={m.id}>
              <div className="thumb">
                {m.type === "image" && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.url} alt="" />
                )}
                {m.type === "video" && <video src={m.url} muted preload="metadata" />}
                {m.type === "youtube" && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={`https://i.ytimg.com/vi/${youtubeId(m.url)}/mqdefault.jpg`} alt="" />
                )}
                {p.cover === m.url && <span className="badge">Capa</span>}
              </div>
              <input
                aria-label="Legenda"
                placeholder="Legenda (opcional)"
                value={m.caption}
                onChange={(e) => onChange(p.media.map((x) => (x.id === m.id ? { ...x, caption: e.target.value } : x)), p.cover)}
              />
              <div className="media-actions">
                {m.type === "image" && p.cover !== m.url && (
                  <button type="button" className="a-btn ghost" onClick={() => onChange(p.media, m.url)}>
                    Usar como capa
                  </button>
                )}
                <button type="button" className="a-btn ghost" aria-label="Mover para cima" onClick={() => move(i, -1)}>
                  ↑
                </button>
                <button type="button" className="a-btn ghost" aria-label="Mover para baixo" onClick={() => move(i, 1)}>
                  ↓
                </button>
                <button
                  type="button"
                  className="a-btn ghost"
                  onClick={() => onChange(p.media.filter((x) => x.id !== m.id), p.cover === m.url ? "" : p.cover)}
                >
                  Remover
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ---------------- perfil ---------------- */

function ProfileEditor({ profile, onChange }: { profile: Content["profile"]; onChange: (p: Content["profile"]) => void }) {
  const set = <K extends keyof Content["profile"]>(key: K, value: Content["profile"][K]) => onChange({ ...profile, [key]: value });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      set("cvUrl", await uploadFile(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha no upload.");
    }
    setBusy(false);
  }

  return (
    <section className="pform">
      <div className="pform-head">
        <h2>Sobre e contato</h2>
      </div>
      <div className="grid">
        <Field label="Seu nome">
          <input value={profile.name} onChange={(e) => set("name", e.target.value)} />
        </Field>
        <Field label="Profissão">
          <input value={profile.role} onChange={(e) => set("role", e.target.value)} />
        </Field>
        <Field label="Frase principal (aparece abaixo do nome)" wide>
          <input value={profile.headline} onChange={(e) => set("headline", e.target.value)} />
        </Field>
        <Field label="Apresentação curta" wide>
          <textarea rows={3} value={profile.intro} onChange={(e) => set("intro", e.target.value)} />
        </Field>
        <Field label="Como entrei na área" hint="Deixe uma linha em branco para separar parágrafos." wide>
          <textarea rows={8} value={profile.story} onChange={(e) => set("story", e.target.value)} />
        </Field>
        <Field label="Cidade ou região">
          <input value={profile.location} onChange={(e) => set("location", e.target.value)} />
        </Field>
        <Field label="E-mail">
          <input type="email" value={profile.email} onChange={(e) => set("email", e.target.value)} />
        </Field>
        <Field label="WhatsApp" hint="Com DDD. Ex.: 11 91234-5678">
          <input value={profile.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
        </Field>
        <Field label="Telefone (opcional)">
          <input value={profile.phone} onChange={(e) => set("phone", e.target.value)} />
        </Field>
        <Field label="LinkedIn">
          <input type="url" value={profile.linkedin} onChange={(e) => set("linkedin", e.target.value.trim())} />
        </Field>
        <Field label="GitHub">
          <input type="url" value={profile.github} onChange={(e) => set("github", e.target.value.trim())} />
        </Field>
        <Field label="Instagram">
          <input type="url" value={profile.instagram} onChange={(e) => set("instagram", e.target.value.trim())} />
        </Field>
        <Field label="Currículo em PDF" hint={profile.cvUrl ? "Arquivo enviado." : "Opcional."}>
          <div className="row2">
            <label className="a-btn">
              {busy ? "Enviando…" : profile.cvUrl ? "Trocar PDF" : "Enviar PDF"}
              <input type="file" accept="application/pdf" hidden onChange={(e) => upload(e.target.files?.[0])} />
            </label>
            {profile.cvUrl && (
              <button type="button" className="a-btn ghost" onClick={() => set("cvUrl", "")}>
                Remover
              </button>
            )}
          </div>
        </Field>
      </div>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <label className="check">
        <input type="checkbox" checked={profile.available} onChange={(e) => set("available", e.target.checked)} />
        Estou disponível para novos projetos
      </label>
    </section>
  );
}

/* ---------------- listas simples ---------------- */

type FieldDef = { key: string; label: string; kind?: "text" | "textarea" | "area"; wide?: boolean };

function ListEditor<T extends { id: string }>({
  title,
  hint,
  items,
  onChange,
  blank,
  fields,
}: {
  title: string;
  hint?: string;
  items: T[];
  onChange: (v: T[]) => void;
  blank: () => T;
  fields: FieldDef[];
}) {
  const update = (id: string, key: string, value: string) =>
    onChange(items.map((it) => (it.id === id ? { ...it, [key]: value } : it)));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <section className="pform">
      <div className="pform-head">
        <h2>{title}</h2>
        <button type="button" className="a-btn primary" onClick={() => onChange([...items, blank()])}>
          + Adicionar
        </button>
      </div>
      {hint && <p className="hint">{hint}</p>}
      <ul className="list-edit">
        {items.map((it, i) => {
          const rec = it as unknown as Record<string, string>;
          return (
            <li key={it.id}>
              <div className="grid">
                {fields.map((f) => (
                  <Field key={f.key} label={f.label} wide={f.wide}>
                    {f.kind === "area" ? (
                      <AreaSelect value={rec[f.key] as Area} onChange={(v) => update(it.id, f.key, v)} />
                    ) : f.kind === "textarea" ? (
                      <textarea rows={2} value={rec[f.key]} onChange={(e) => update(it.id, f.key, e.target.value)} />
                    ) : (
                      <input value={rec[f.key]} onChange={(e) => update(it.id, f.key, e.target.value)} />
                    )}
                  </Field>
                ))}
              </div>
              <div className="media-actions">
                <button type="button" className="a-btn ghost" aria-label="Mover para cima" onClick={() => move(i, -1)}>
                  ↑
                </button>
                <button type="button" className="a-btn ghost" aria-label="Mover para baixo" onClick={() => move(i, 1)}>
                  ↓
                </button>
                <button type="button" className="a-btn ghost" onClick={() => onChange(items.filter((x) => x.id !== it.id))}>
                  Remover
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      {!items.length && <p className="hint">Nada aqui ainda. Use “+ Adicionar”.</p>}
    </section>
  );
}

/* ---------------- pequenos componentes ---------------- */

function Field({ label, hint, wide, children }: { label: string; hint?: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <label className={`field${wide ? " wide" : ""}`}>
      <span className="field-label">{label}</span>
      {children}
      {hint && <span className="hint">{hint}</span>}
    </label>
  );
}

function AreaSelect({ value, onChange }: { value: Area; onChange: (v: Area) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value as Area)}>
      <option value="dev">Programação</option>
      <option value="mkt">Marketing</option>
    </select>
  );
}

function TagsInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const joined = useMemo(() => value.join(", "), [value]);
  const [text, setText] = useState(joined);
  useEffect(() => setText(joined), [joined]);
  return (
    <input
      value={text}
      placeholder="React, Node.js, Supabase"
      onChange={(e) => setText(e.target.value)}
      onBlur={() =>
        onChange(
          text
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        )
      }
    />
  );
}
