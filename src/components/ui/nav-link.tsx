"use client";

import { usePathname } from "next/navigation";

import { QuietLink } from "@/components/ui/quiet-link";

/**
 * A navigation link that says so when it leads to the page already open.
 *
 * Four links that all look alike leave a visitor with nothing to tell them
 * where they are, and the header is the only thing on a static site that can
 * answer it. Marked with an underline rather than a brighter colour, because
 * hover already takes the colour to `blush-100`: a mouse passing over any
 * link would otherwise make it look current.
 *
 * `aria-current="page"` carries the same answer to a screen reader, which the
 * underline alone would not.
 */
export function NavLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const sciezka = usePathname();

  /*
   * A realization is one of "Realizacje", so `/realizacje/wesele-w-stodole`
   * keeps the section marked. The prefix is matched at a path separator so
   * `/realizacje-abc` could never count as one.
   */
  const aktywne = sciezka === href || sciezka.startsWith(`${href}/`);

  const podkreslenie = aktywne
    ? "text-blush-100 underline decoration-blush-300 decoration-1 underline-offset-8"
    : "";

  return (
    <QuietLink
      href={href}
      aria-current={aktywne ? "page" : undefined}
      className={className ? `${className} ${podkreslenie}` : podkreslenie}
    >
      {children}
    </QuietLink>
  );
}
