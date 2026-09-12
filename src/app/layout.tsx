import type { Metadata } from "next";
import { Glass_Antiqua, Jost, Marcellus } from "next/font/google";

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

// The wordmark only — matches the client's own logo (see
// `docs/superpowers/specs`), which is deliberately not `--font-display`: that
// one is Marcellus, set for every heading on the site. Glass Antiqua ships one
// weight, 400.
const glassAntiqua = Glass_Antiqua({
  variable: "--font-glass-antiqua",
  subsets: ["latin-ext"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  // Every relative URL in a page's metadata — canonicals and preview images
  // most of all — is resolved against this.
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} - dekoracje weselne i okolicznościowe w ${site.cityLocative}`,
    template: `%s - ${site.name}`,
  },
  description: site.description,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pl"
      className={`${marcellus.variable} ${jost.variable} ${glassAntiqua.variable}`}
    >
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
