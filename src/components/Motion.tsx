"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Entradas dos elementos com [data-reveal] e a variável --sy usada no paralaxe das marcas.
 * Sem JavaScript, nada fica escondido (a classe .js só existe com script).
 */
export function Motion() {
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.classList.add("motion-ready");
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]:not(.in)"));
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  useEffect(() => {
    const root = document.documentElement;
    let frame = 0;
    const update = () => {
      frame = 0;
      root.style.setProperty("--sy", String(window.scrollY));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
