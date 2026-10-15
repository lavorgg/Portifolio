"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useFace } from "./face";

export function Nav({ name }: { name: string }) {
  const { face } = useFace();
  const pathname = usePathname();
  const onHome = pathname === "/";
  const [hidden, setHidden] = useState(false);

  // some ao rolar para baixo e volta ao rolar para cima, para não cobrir o conteúdo
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - last) < 8) return;
      setHidden(y > last && y > 160);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="nav" data-hidden={hidden} onFocus={() => setHidden(false)}>
      <Link href="/" className="wordmark">
        {name}
      </Link>
      <nav aria-label="Principal" className="nav-links">
        <Link href={onHome ? "#sobre" : "/#sobre"} className="nav-link hide-sm">
          Sobre
        </Link>
        <div className="face-switch" data-active={face}>
          <span className="face-thumb" aria-hidden="true" />
          <Link href="/dev" aria-current={pathname.startsWith("/dev") ? "page" : undefined}>
            Dev
          </Link>
          <Link href="/marketing" aria-current={pathname.startsWith("/marketing") ? "page" : undefined}>
            Marketing
          </Link>
        </div>
        <Link href={onHome ? "#contato" : "/#contato"} className="nav-link">
          Contato
        </Link>
      </nav>
    </header>
  );
}
