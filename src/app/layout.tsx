import type { Metadata } from "next";
import { Jost, Marcellus } from "next/font/google";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { site } from "@/lib/site";

import "./globals.css";

// `latin-ext` is what carries ą, ć, ę, ł, ń, ó, ś, ź and ż. Without it the
// whole site renders Polish copy in a fallback face.
const marcellus = Marcellus({
  variable: "--font-marcellus",
  subsets: ["latin-ext"],
  weight: "400",
  display: "swap",
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${site.name} — dekoracje weselne i okolicznościowe w ${site.city}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl" className={`${marcellus.variable} ${jost.variable}`}>
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
