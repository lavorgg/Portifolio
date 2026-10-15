import "server-only";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { getContent } from "./store";

export const CONTENT_TAG = "content";

// O site público lê o conteúdo do cache, e não do banco a cada visita: um pico de acessos
// (ou alguém martelando a página) não vira um pico de consultas no Supabase.
// O cache é renovado na hora em que o painel salva, e a cada 1 hora por garantia.
const cachedContent = unstable_cache(getContent, ["site-content"], { tags: [CONTENT_TAG], revalidate: 3600 });

/** Uma leitura por requisição, mesmo que layout e página peçam o conteúdo. */
export const loadContent = cache(cachedContent);
