"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Area } from "@/lib/schema";

type Ctx = { face: Area; setFace: (f: Area, remember?: boolean) => void };
const FaceContext = createContext<Ctx>({ face: "dev", setFace: () => {} });

export function FaceProvider({ children }: { children: React.ReactNode }) {
  const [face, setFaceState] = useState<Area>("dev");

  useEffect(() => {
    const d = document.documentElement;
    setFaceState(d.dataset.face === "mkt" ? "mkt" : "dev");
    // liga as transições de cor só depois da primeira pintura
    const id = requestAnimationFrame(() => d.classList.add("face-ready"));
    return () => cancelAnimationFrame(id);
  }, []);

  const setFace = useCallback((f: Area, remember = false) => {
    document.documentElement.dataset.face = f;
    setFaceState(f);
    if (remember) {
      try {
        localStorage.setItem("face", f);
      } catch {}
    }
  }, []);

  return <FaceContext.Provider value={{ face, setFace }}>{children}</FaceContext.Provider>;
}

export const useFace = () => useContext(FaceContext);

/** Cada página diz qual face usa. Sem `face`, vale a última escolha do visitante. */
export function FaceSync({ face }: { face?: Area }) {
  const { setFace } = useFace();
  useEffect(() => {
    if (face) return setFace(face);
    let stored: string | null = null;
    try {
      stored = localStorage.getItem("face");
    } catch {}
    setFace(stored === "mkt" ? "mkt" : "dev");
  }, [face, setFace]);
  return null;
}
