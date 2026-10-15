import type { Metadata } from "next";
import Link from "next/link";
import { FaceProvider } from "@/components/face";
import { Marks } from "@/components/Marks";
import { Motion } from "@/components/Motion";
import { Nav } from "@/components/Nav";
import { loadContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await loadContent();
  return {
    title: { default: `${profile.name} · Portfólio`, template: `%s · ${profile.name}` },
    description: profile.intro,
  };
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await loadContent();
  const year = new Date().getFullYear();
  return (
    <FaceProvider>
      <div className="site">
        <Marks />
        <Nav name={profile.name} />
        <main className="main">{children}</main>
        <footer className="footer">
          <p className="footer-name" data-reveal>
            {profile.name}
          </p>
          <div className="footer-row">
            <span>
              {profile.role} · {year}
            </span>
            <span className="footer-links">
              <Link href="/dev">Programação</Link>
              <Link href="/marketing">Marketing</Link>
              <Link href="/#contato">Contato</Link>
            </span>
          </div>
        </footer>
      </div>
      <Motion />
    </FaceProvider>
  );
}
