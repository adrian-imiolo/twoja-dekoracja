import { site } from "@/lib/site";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-24 sm:px-8">
      <h1 className="font-display text-4xl leading-tight text-cream-50 sm:text-5xl">
        {site.tagline} w {site.city}
      </h1>
      <p className="mt-6 max-w-xl text-lg text-cream-50/80">
        {site.description}
      </p>
    </div>
  );
}
