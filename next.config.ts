import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // fixa a raiz do projeto (evita que um package-lock solto na pasta do usuário confunda o build)
  turbopack: { root: process.cwd() },
};

export default nextConfig;
