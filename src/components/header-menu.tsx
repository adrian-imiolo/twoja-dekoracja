"use client";

import { usePathname } from "next/navigation";
import { useId, useRef, useState } from "react";

import { Glif } from "@/components/ui/channel-icons";

/**
 * The header's navigation, disclosed by a menu button below `sm` and laid
 * out as a plain row from `sm` up.
 *
 * One `nav` for both layouts rather than a phone copy and a desktop copy, and
 * the responsive pass depends on that: a button hidden at desktop widths is
 * excused there only because the element it controls is on screen, and a
 * closed panel's links only because a visible button controls them. Two navs
 * would leave one of them hidden with nothing vouching for it.
 *
 * An inline panel, not an overlay: four links on a static site do not earn a
 * focus trap, a scroll lock or a backdrop. It pushes the page down, and it
 * shows and hides without a transition.
 *
 * The links arrive as children, rendered on the server; only whether they are
 * shown is decided here.
 */
export function HeaderMenu({
  className,
  children,
}: {
  /**
   * Layout of the `nav` from `sm` up, which is the header's to decide. Below
   * `sm` the nav is the panel, and its layout is set here.
   */
  className: string;
  children: React.ReactNode;
}) {
  const sciezka = usePathname();
  const idPanelu = useId();
  const przycisk = useRef<HTMLButtonElement>(null);

  const [otwarte, setOtwarte] = useState(false);

  /*
   * The header lives in the root layout and survives a client-side
   * navigation, so an open menu would otherwise follow the visitor onto the
   * next page however they got there, footer link and Back button included.
   * Reset while rendering rather than in an effect, which would paint the new
   * page with the menu still open and then render the header again to close
   * it.
   */
  const [sciezkaOstatnia, setSciezkaOstatnia] = useState(sciezka);
  if (sciezka !== sciezkaOstatnia) {
    setSciezkaOstatnia(sciezka);
    setOtwarte(false);
  }

  function zamknij() {
    setOtwarte(false);
  }

  function przelacz() {
    setOtwarte(!otwarte);
  }

  function zamknijKlawiszemEscape(zdarzenie: React.KeyboardEvent) {
    if (!otwarte || zdarzenie.key !== "Escape") return;
    zamknij();
    przycisk.current?.focus();
  }

  /*
   * A link to the page already open changes no route, so the reset above
   * never sees it. Closing on the click itself covers that
   * one, and leaves focus where the router puts it for every other.
   */
  function zamknijPoWyborzeStrony(zdarzenie: React.MouseEvent) {
    if (!(zdarzenie.target instanceof Element)) return;
    if (!zdarzenie.target.closest("a")) return;
    zamknij();
  }

  return (
    <>
      <button
        ref={przycisk}
        type="button"
        aria-expanded={otwarte}
        aria-controls={idPanelu}
        onClick={przelacz}
        onKeyDown={zamknijKlawiszemEscape}
        aria-label="Menu"
        className="grid min-h-11 min-w-11 place-items-center text-2xl text-blush-300 transition-colors hover:text-blush-100 sm:hidden"
      >
        {/* The name stays "Menu" either way: `aria-expanded` already says which. */}
        <Glif>
          <path
            d={otwarte ? "M6 6l12 12M18 6 6 18" : "M4 7h16M4 12h16M4 17h16"}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </Glif>
      </button>
      <nav
        id={idPanelu}
        aria-label="Główna"
        onClick={zamknijPoWyborzeStrony}
        onKeyDown={zamknijKlawiszemEscape}
        className={`${otwarte ? "" : "max-sm:hidden"} max-sm:basis-full max-sm:flex-col max-sm:items-stretch max-sm:gap-y-0 ${className}`}
      >
        {children}
      </nav>
    </>
  );
}
