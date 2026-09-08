import type { NextConfig } from "next";

/**
 * A production build that cannot send mail is refused.
 *
 * The route handler already fails a submission it cannot deliver, and shows
 * the visitor the phone number instead — but that is a second line of defence,
 * and by the time it fires someone has already tried to get in touch and
 * failed. A deployment is the last moment the mistake costs nothing.
 *
 * Scoped to production rather than to every Vercel build on purpose: a preview
 * has no business holding a live sending key, and failing its build over one
 * would stop pull requests being reviewable. A preview that is missing the
 * configuration says so at the moment someone submits the form on it, which is
 * the right cost for a preview and the wrong one for production.
 */
function wymagajKonfiguracjiZapytan(): void {
  if (process.env.VERCEL_ENV !== "production") return;

  const brakujace = ["RESEND_API_KEY", "CONTACT_TO_EMAIL"].filter(
    (zmienna) => !process.env[zmienna],
  );
  if (brakujace.length === 0) return;

  throw new Error(
    `Produkcyjny build nie mógłby wysłać żadnego zapytania — brakuje: ${brakujace.join(", ")}.`,
  );
}

wymagajKonfiguracjiZapytan();

const nextConfig: NextConfig = {};

export default nextConfig;
