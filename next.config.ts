import type { NextConfig } from "next";

const dev = process.env.NODE_ENV !== "production";
// os uploads vão do navegador direto para o Supabase
const supabase = process.env.SUPABASE_URL ? new URL(process.env.SUPABASE_URL).origin : "";

// No GitHub Codespaces o site é aberto por um endereço *.app.github.dev, mas o servidor se vê como
// localhost: sem liberar esse domínio, o Next recusa o login (proteção contra CSRF). Só vale lá dentro.
const codespacesDomain = process.env.CODESPACES ? process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN : "";

const csp = [
  "default-src 'self'",
  // 'unsafe-inline': o script que escolhe a cor da página antes de pintar é inline
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' ${supabase}${dev ? " ws: wss:" : ""}`.trim(),
  "frame-src https://www.youtube-nocookie.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // fixa a raiz do projeto (evita que um package-lock solto na pasta do usuário confunda o build)
  turbopack: { root: process.cwd() },
  ...(codespacesDomain && { experimental: { serverActions: { allowedOrigins: [`*.${codespacesDomain}`] } } }),
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
