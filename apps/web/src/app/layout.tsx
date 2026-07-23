import type { Metadata, Viewport } from 'next';
import { Outfit, Inter } from "next/font/google";
// globals.css already pulls in @toolshare/ui/styles/toolshare.css (which in
// turn imports the shared token base) — importing it again here would emit
// the whole token layer twice.
import './globals.css';
import { Providers } from './providers';
import { SiteFooter } from '@/components/SiteFooter';

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: 'Toolshare - Rent Tools from Neighbors',
    template: '%s | Toolshare',
  },
  description:
    'Rent power tools, construction equipment, and specialty tools from neighbors in the Phoenix metro area.',
  metadataBase: new URL('https://toolshare.app'),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Keep in sync with --color-primary-500 in packages/ui/styles/toolshare.css
  // (Figma "Terracotta" 500) — a meta tag can't read a CSS custom property.
  themeColor: "#c25a3d",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable} h-full antialiased`}>
      {/*
        `flex flex-col` makes every page-level <header>/<main> a flex item.
        Gotcha: an auto margin on a flex item's cross axis SUPPRESSES
        stretching, so `<main className="mx-auto max-w-3xl">` does not fill
        the row and then centre — it shrinks to fit its content and centres
        that. Pages centring a <main> must pair it with `w-full` (see any
        page under app/) so the item has a definite size for max-width to
        cap. Containers nested inside a <main> aren't flex items and are
        unaffected.
      */}
      <body className="min-h-full flex flex-col bg-background text-foreground font-body">
        <Providers>
          {children}
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
