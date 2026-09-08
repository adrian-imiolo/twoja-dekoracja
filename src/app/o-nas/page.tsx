import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { DO_UZUPELNIENIA, site } from "@/lib/site";
import { portret } from "@content/o-nas";

/**
 * The page that turns a brand into a person.
 *
 * A wedding is expensive and unrepeatable, and it is being handed to someone
 * found on the internet. The archive proves the work is good; this page is the
 * only one that answers who would actually turn up at the venue. For a service
 * bought on trust it does as much work as the photographs do.
 *
 * PLACEHOLDER COPY, with one deliberate exception to how the rest of the site
 * handles that. Everywhere else, placeholder prose is plausible invented copy
 * the client rewrites. Here the personal story is left as an explicit
 * `[DO UZUPEŁNIENIA]` marker instead, because inventing one is different in
 * kind from inventing a lead time: a fabricated account of why a real person
 * does this work is not a rough draft of the truth, and it is the single
 * paragraph on the site most likely to be read closely and quoted back. What
 * *is* written out is what the site already knows to be true — what the
 * business does, where, and how it works — so the page has a real shape to
 * receive the story rather than being a page of markers.
 */

const OPIS = `Kto stoi za pracownią ${site.name} i dlaczego zajmujemy się dekoracjami przyjęć w ${site.cityLocative}.`;

export const metadata: Metadata = {
  title: "O nas",
  description: OPIS,
  alternates: { canonical: "/o-nas" },
  openGraph: {
    type: "website",
    locale: "pl_PL",
    siteName: site.name,
    url: "/o-nas",
    title: `O nas — ${site.name}`,
    description: OPIS,
  },
};

export default function ONasPage() {
  return (
    <div className="page-shell py-20 sm:py-28">
      <header className="max-w-2xl">
        <p className="text-sm tracking-[0.25em] text-blush-300 uppercase">
          Kim jesteśmy
        </p>
        <h1 className="mt-6 font-display text-4xl leading-tight text-cream-50 sm:text-5xl">
          Za każdą dekoracją stoi konkretna osoba
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-cream-50/85">
          {site.name} to niewielka pracownia dekoracji z {site.cityLocative}.
          Nie jest to agencja z centralą i podwykonawcami — przyjęć w sezonie
          bierzemy tyle, ile da się zrobić dobrze.
        </p>
      </header>

      {/*
       * The portrait leads on a phone, where it sits above the story, and sits
       * beside it from the width at which both fit. It is given a fixed
       * portrait frame rather than being allowed to take its own shape,
       * because the placeholder and the real photograph will not agree on one
       * and the layout must not move when it is swapped.
       */}
      <div className="mt-16 grid gap-12 sm:mt-20 lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-20">
        <div>
          <div className="relative aspect-4/5 overflow-hidden bg-plum-900">
            <Image
              src={portret.image}
              alt={portret.alt}
              placeholder="blur"
              fill
              sizes="(min-width: 64rem) 20rem, 100vw"
              className="object-cover"
            />
          </div>
          <p className="mt-5 text-sm leading-relaxed text-cream-50/60">
            {site.owner}
            <br />
            {site.name}, {site.city}
          </p>
        </div>

        <div className="max-w-xl">
          <section aria-labelledby="jak-to-sie-zaczelo">
            <h2
              id="jak-to-sie-zaczelo"
              className="font-display text-2xl text-blush-200 sm:text-3xl"
            >
              Jak to się zaczęło
            </h2>
            {/*
             * The client's own story, in their words. Everything the site can
             * honestly say without it is already said above and below.
             */}
            <p className="mt-6 leading-relaxed text-cream-50/80">
              {DO_UZUPELNIENIA} — historia pracowni: od czego się zaczęło, jak
              długo trwa i co po drodze okazało się najważniejsze.
            </p>
          </section>

          <section aria-labelledby="dlaczego" className="mt-14">
            <h2
              id="dlaczego"
              className="font-display text-2xl text-blush-200 sm:text-3xl"
            >
              Dlaczego to robimy
            </h2>
            <p className="mt-6 leading-relaxed text-cream-50/80">
              Wesele albo okrągłe urodziny zdarzają się raz. Nikt nie ma na nie
              drugiego podejścia i nikt nie ćwiczy ich wcześniej — a osoby,
              które je organizują, mają tego dnia sto innych rzeczy na głowie.
              Dekoracja jest jedną z niewielu, które da się z nich zdjąć w
              całości.
            </p>
            <p className="mt-4 leading-relaxed text-cream-50/80">
              {DO_UZUPELNIENIA} — kilka zdań o tym, co w tej pracy daje
              satysfakcję i dlaczego robi się ją właśnie tak.
            </p>
          </section>

          <section aria-labelledby="jak-pracujemy" className="mt-14">
            <h2
              id="jak-pracujemy"
              className="font-display text-2xl text-blush-200 sm:text-3xl"
            >
              Jak pracujemy
            </h2>
            <p className="mt-6 leading-relaxed text-cream-50/80">
              Rozmawiamy o tym, jak wyobrażacie sobie salę, i proponujemy
              dekorację, która to oddaje — a potem przyjeżdżamy, budujemy ją od
              zera i zabieramy po przyjęciu. Ustalona kwota jest kwotą końcową,
              a wszystko, co jest w niej zawarte, mówimy wprost, zanim
              cokolwiek zostanie zarezerwowane.
            </p>
            <p className="mt-6 text-sm tracking-[0.2em] text-blush-300 uppercase">
              {site.serviceArea.join(" · ")}
            </p>
            <p className="mt-8">
              <Link
                href="/faq"
                className="text-sm tracking-[0.25em] text-blush-300 uppercase transition-colors hover:text-blush-100"
              >
                Częste pytania
              </Link>
            </p>
          </section>
        </div>
      </div>

      <section className="mt-20 border border-plum-800 bg-plum-900 px-8 py-12 text-center sm:mt-28 sm:px-16 sm:py-16">
        <h2 className="font-display text-2xl leading-tight text-cream-50 sm:text-3xl">
          Opowiedzcie nam o swoim przyjęciu
        </h2>
        <p className="mx-auto mt-4 max-w-xl leading-relaxed text-cream-50/80">
          Napiszcie, co planujecie i kiedy — odpiszemy, czy termin jest wolny.
        </p>
        <p className="mt-8">
          <Link
            href="/kontakt"
            className="inline-block border border-blush-300 px-8 py-4 text-sm tracking-[0.2em] text-blush-200 uppercase transition-colors hover:bg-blush-300 hover:text-plum-950"
          >
            Napisz do nas
          </Link>
        </p>
      </section>
    </div>
  );
}
