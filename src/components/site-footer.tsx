import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-plum-800">
      <div className="page-shell flex flex-col gap-3 py-12 text-sm text-cream-50/70">
        <p className="font-display tracking-[0.3em] text-blush-200 uppercase">
          {site.wordmark}
        </p>
        <p>
          {site.tagline} — {site.serviceArea.join(", ")}.
        </p>
        <p>
          {site.owner} · tel. {site.phone} · {site.email} · Instagram{" "}
          {site.instagram}
        </p>
      </div>
    </footer>
  );
}
