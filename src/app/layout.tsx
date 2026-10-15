import type { Metadata, Viewport } from "next";
import { Instrument_Sans, Unbounded } from "next/font/google";
import "./globals.css";

const display = Unbounded({ subsets: ["latin"], weight: ["500", "700", "800"], variable: "--font-display" });
const body = Instrument_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });

export const metadata: Metadata = { title: "Portfólio" };
export const viewport: Viewport = { themeColor: "#0c1530" };

// Decide a "face" antes da primeira pintura, para a página não piscar na cor errada.
const boot = `(function(){var d=document.documentElement;d.classList.add('js');var p=location.pathname,f;
if(p.indexOf('/dev')===0)f='dev';else if(p.indexOf('/marketing')===0)f='mkt';
else{try{f=localStorage.getItem('face')}catch(e){}}d.dataset.face=f==='mkt'?'mkt':'dev';})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" data-face="dev" className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
