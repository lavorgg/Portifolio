"use client";

import { useState } from "react";

export function CopyButton({ text, label = "Copiar" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="btn btn-quiet"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1800);
        } catch {}
      }}
    >
      <span aria-live="polite">{done ? "Copiado" : label}</span>
    </button>
  );
}
