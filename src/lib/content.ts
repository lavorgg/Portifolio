import "server-only";
import { cache } from "react";
import { getContent } from "./store";

/** Uma leitura por requisição, mesmo que layout e página peçam o conteúdo. */
export const loadContent = cache(getContent);
