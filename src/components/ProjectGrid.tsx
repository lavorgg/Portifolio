"use client";

import { Children, useState } from "react";

/** Grade de projetos com filtro por tecnologia ou ferramenta. */
export function ProjectGrid({
  tags,
  items,
  children,
}: {
  tags: string[];
  items: { id: string; tags: string[] }[];
  children: React.ReactNode;
}) {
  const [tag, setTag] = useState<string | null>(null);
  const cards = Children.toArray(children);
  const visible = cards.filter((_, i) => !tag || items[i]?.tags.includes(tag));

  return (
    <>
      {tags.length > 1 && (
        <div className="filters" role="group" aria-label="Filtrar projetos">
          <button type="button" aria-pressed={tag === null} onClick={() => setTag(null)}>
            Todos
          </button>
          {tags.map((t) => (
            <button key={t} type="button" aria-pressed={tag === t} onClick={() => setTag(tag === t ? null : t)}>
              {t}
            </button>
          ))}
        </div>
      )}
      <div className={`project-grid${tag ? " filtered" : ""}`} key={tag ?? "all"}>
        {visible}
      </div>
    </>
  );
}
