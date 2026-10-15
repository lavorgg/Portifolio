import type { CSSProperties, ReactNode } from "react";

/*
 * Desenhos de fundo. Cada face tem o seu vocabulário:
 * programação desenha sinais de código, marketing desenha sinais de campanha.
 * Os traços se desenham sozinhos quando a face muda (pathLength + stroke-dashoffset).
 */

const P = (d: string) => <path d={d} pathLength={1} />;
const C = (cx: number, cy: number, r: number) => <circle cx={cx} cy={cy} r={r} pathLength={1} />;

const DEV: Record<string, ReactNode> = {
  tag: (<>{P("M30 25 L10 50 L30 75")}{P("M70 25 L90 50 L70 75")}{P("M58 16 L42 84")}</>),
  braces: (<>{P("M38 14 C26 14 30 30 28 42 C27 48 22 50 16 50 C22 50 27 52 28 58 C30 70 26 86 38 86")}{P("M62 14 C74 14 70 30 72 42 C73 48 78 50 84 50 C78 50 73 52 72 58 C70 70 74 86 62 86")}</>),
  prompt: (<>{P("M14 28 L42 50 L14 72")}{P("M52 74 L88 74")}</>),
  branch: (<>{C(25, 18, 7)}{C(25, 82, 7)}{C(72, 36, 7)}{P("M25 25 L25 75")}{P("M25 64 C25 46 72 56 72 43")}</>),
  brackets: (<>{P("M36 14 L20 14 L20 86 L36 86")}{P("M64 14 L80 14 L80 86 L64 86")}</>),
  cursor: (<>{P("M26 12 L26 80 L42 65 L55 90 L66 85 L53 60 L76 60 Z")}</>),
  semi: (<>{C(50, 30, 7)}{P("M50 62 C54 70 52 80 44 88")}{C(50, 62, 7)}</>),
};

const MKT: Record<string, ReactNode> = {
  spark: (<>{P("M50 6 C54 38 62 46 94 50 C62 54 54 62 50 94 C46 62 38 54 6 50 C38 46 46 38 50 6 Z")}</>),
  trend: (<>{P("M8 82 L38 52 L56 68 L90 28")}{P("M66 26 L92 26 L92 52")}</>),
  heart: (<>{P("M50 86 C20 62 8 45 14 30 C20 15 40 14 50 30 C60 14 80 15 86 30 C92 45 80 62 50 86 Z")}</>),
  quote: (<>{C(30, 60, 12)}{P("M18 58 C18 40 26 28 40 22")}{C(70, 60, 12)}{P("M58 58 C58 40 66 28 80 22")}</>),
  megaphone: (<>{P("M16 40 L16 62 L32 62 L72 84 L72 18 L32 40 Z")}{P("M32 62 L38 86 L48 86 L44 64")}{P("M82 38 C88 44 88 58 82 64")}</>),
  target: (<>{C(50, 50, 40)}{C(50, 50, 24)}{C(50, 50, 8)}</>),
  at: (<>{C(50, 50, 14)}{P("M64 40 L64 58 C64 68 80 68 83 54 C88 30 70 12 50 12 C28 12 12 30 12 50 C12 72 30 88 52 88 C62 88 70 85 76 80")}</>),
  hash: (<>{P("M40 14 L32 86")}{P("M68 14 L60 86")}{P("M18 38 L84 38")}{P("M14 64 L80 64")}</>),
};

type Spot = [shape: string, left: number, top: number, size: number, rot: number, depth: number, solid?: boolean];

// posições em % da altura da página; as laterais ficam com quase tudo para não brigar com o texto
const DEV_SPOTS: Spot[] = [
  ["tag", 84, 3, 150, -8, -0.08], ["braces", 3, 9, 110, 6, -0.04], ["prompt", 60, 15, 70, 0, -0.12],
  ["branch", 90, 21, 120, 10, -0.05], ["cursor", 6, 27, 80, -14, -0.1], ["brackets", 78, 34, 100, 4, -0.06],
  ["semi", 2, 41, 70, 12, -0.03], ["tag", 88, 48, 90, 14, -0.1], ["braces", 8, 55, 140, -6, -0.06],
  ["prompt", 82, 62, 110, -4, -0.04], ["branch", 4, 69, 90, -12, -0.09], ["cursor", 91, 75, 70, 18, -0.05],
  ["brackets", 10, 82, 110, -4, -0.07], ["tag", 70, 88, 120, 6, -0.04], ["semi", 92, 94, 60, -8, -0.08],
];

const MKT_SPOTS: Spot[] = [
  ["spark", 86, 3, 130, 0, -0.08, true], ["heart", 4, 9, 90, -10, -0.05], ["trend", 62, 15, 110, 0, -0.12],
  ["quote", 90, 21, 100, 6, -0.05], ["spark", 7, 27, 60, 14, -0.1, true], ["megaphone", 79, 34, 120, -8, -0.06],
  ["at", 3, 41, 90, 10, -0.03], ["target", 88, 48, 110, 0, -0.1], ["hash", 7, 55, 100, -8, -0.06],
  ["spark", 83, 62, 70, 20, -0.04, true], ["trend", 4, 69, 120, -6, -0.09], ["heart", 90, 75, 80, 12, -0.05],
  ["quote", 10, 82, 90, -6, -0.07], ["megaphone", 72, 88, 100, 6, -0.04], ["spark", 92, 94, 90, -10, -0.08, true],
];

function Layer({ face, shapes, spots }: { face: string; shapes: Record<string, ReactNode>; spots: Spot[] }) {
  return (
    <div className={`marks-layer marks-${face}`}>
      {spots.map(([shape, left, top, size, rot, depth, solid], i) => (
        <span
          key={i}
          className="mark"
          style={
            {
              left: `${left}%`,
              top: `${top}%`,
              "--s": `${size}px`,
              "--r": `${rot}deg`,
              "--depth": depth,
              "--i": i,
              "--dur": `${9 + (i % 5) * 2.5}s`,
            } as CSSProperties
          }
        >
          <svg viewBox="0 0 100 100" className={solid ? "solid" : undefined} aria-hidden="true" focusable="false">
            {shapes[shape]}
          </svg>
        </span>
      ))}
    </div>
  );
}

export function Marks() {
  return (
    <div className="marks" aria-hidden="true">
      <Layer face="dev" shapes={DEV} spots={DEV_SPOTS} />
      <Layer face="mkt" shapes={MKT} spots={MKT_SPOTS} />
    </div>
  );
}

/** Um desenho solto, para capas sem imagem e detalhes de seção. */
export function Mark({ face, shape, className }: { face: "dev" | "mkt"; shape?: string; className?: string }) {
  const set = face === "dev" ? DEV : MKT;
  const key = shape && set[shape] ? shape : Object.keys(set)[0];
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" focusable="false">
      {set[key]}
    </svg>
  );
}

export const MARK_NAMES = { dev: Object.keys(DEV), mkt: Object.keys(MKT) };
