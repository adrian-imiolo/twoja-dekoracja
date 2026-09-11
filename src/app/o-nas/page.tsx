import type { Metadata } from "next";
import Image from "next/image";

import { CalloutPanel } from "@/components/ui/callout-panel";
import { PrimaryCta } from "@/components/ui/primary-cta";
import { QuietLink } from "@/components/ui/quiet-link";
import { asOgImage, sharePreview } from "@/lib/metadata";
import { site } from "@/lib/site";
import { portret } from "@content/o-nas";

/**
 * The page that turns a brand into a person.
 *
 * A wedding is expensive and unrepeatable, and it is being handed to someone
 * found on the internet. The archive proves the work is good; this page is the
 * only one that answers who would actually turn up at the venue. For a service
 * bought on trust it does as much work as the photographs do.
 *
 * The story is the owners' own, given by them and written up here rather than
 * invented — which is why it stayed a `[DO UZUPEŁNIENIA]` marker until they
 * had told it. A fabricated account of why a real person does this work is not
 * a rough draft of the truth, and this is the paragraph on the site most
 * likely to be read closely and quoted back.
 *
 * What the page deliberately does not say is that either of them does this
 * full time. The business is działalność nierejestrowana, which caps monthly
 * revenue — "na pełen etat" would be warm, plausible, and contradicted by the
 * same legal status the footer and the privacy policy both rest on.
 */

const OPIS = `Kto stoi za pracownią ${site.name} i dlaczego zajmujemy się dekoracjami przyjęć w ${site.cityLocative}.`;

export const metadata: Metadata = {
  title: "O nas",
  description: OPIS,
  ...sharePreview({
    path: "/o-nas",
    title: `O nas — ${site.name}`,
    description: OPIS,
    // The one page whose subject is the person rather than the work, so it
    // previews with the portrait the page itself leads on.
    images: [asOgImage(portret)],
  }),
};

export default function ONasPage() {
  return (
    <div className="page-shell py-20 sm:py-28">
      <header className="max-w-2xl">
        <p className="text-sm tracking-[0.25em] text-blush-300 uppercase">
          Kim jesteśmy
        </p>
        <h1 className="mt-6 font-display text-4xl leading-tight text-cream-50 sm:text-5xl">
          Za każdą dekoracją stoją konkretne osoby
        </h1>
        {/*
         * The genitive, not the locative: "pracownia dekoracji ze Szczecina".
         * The locative beside it is the form "w …" takes and is what the page
         * description uses — putting either in the other's place is the kind
         * of error a visitor from the city reads before they read anything.
         */}
        <p className="mt-6 text-lg leading-relaxed text-cream-50/85">
          {site.name} to niewielka pracownia dekoracji ze {site.cityGenitive}.
          Nie jest to agencja z centralą i podwykonawcami — jesteśmy we dwie, a
          przy każdym przyjęciu jesteśmy obie: od pustej sali po ostatni
          element, który z niej zabieramy.
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
            {site.owners.map((wlascicielka) => wlascicielka.name).join(" i ")}
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
            {/* The owners' own story, in their words, written up. */}
            <p className="mt-6 leading-relaxed text-cream-50/80">
              Obie skończyłyśmy studia architektoniczne i obie trafiłyśmy tu tą
              samą drogą — od patrzenia na wnętrze jak na coś, co się
              projektuje, a nie tylko zastawia stołami. Zaczęło się od przyjęć w
              rodzinie i u znajomych: chrzciny, osiemnastka, potem pierwsze
              wesele. Za każdym razem okazywało się to samo — że to, co dla nas
              jest układaniem kompozycji, proporcji i światła, dla kogoś innego
              jest dniem, który zapamięta na zawsze. Z przysługi dla bliskich
              zrobiła się pasja, a z pasji to, czym zajmujemy się dziś.
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
            {/*
             * Where the limit on how much work is taken on belongs: stated as
             * a preference that follows from what the two of them enjoy,
             * rather than announced up front as a constraint. The same fact
             * read as an excuse when it led the page.
             */}
            <p className="mt-4 leading-relaxed text-cream-50/80">
              Najbardziej lubimy dwa momenty. Pierwszy, kiedy wychodzi się z
              sali, która kilka godzin wcześniej była pusta, i widzi się ją
              skończoną. Drugi, kiedy wchodzą do niej goście. Dlatego bierzemy
              tylko tyle przyjęć, ile jesteśmy w stanie obsłużyć osobiście —
              wolimy zrobić mniej i być na miejscu od początku do końca, niż
              rozpisać się na kilka sal naraz i wysłać na nie kogoś, kto Waszą
              dekorację widzi pierwszy raz.
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
              {site.city} i okolice
            </p>
            <p className="mt-8">
              <QuietLink href="/faq">Częste pytania</QuietLink>
            </p>
          </section>
        </div>
      </div>

      <CalloutPanel
        as="section"
        className="mt-20 px-8 py-12 text-center sm:mt-28 sm:px-16 sm:py-16"
      >
        <h2 className="font-display text-2xl leading-tight text-cream-50 sm:text-3xl">
          Opowiedzcie nam o swoim przyjęciu
        </h2>
        <p className="mx-auto mt-4 max-w-xl leading-relaxed text-cream-50/80">
          Napiszcie, co planujecie i kiedy — odpiszemy, czy termin jest wolny.
        </p>
        <p className="mt-8">
          <PrimaryCta href="/kontakt">Napisz do nas</PrimaryCta>
        </p>
      </CalloutPanel>
    </div>
  );
}
