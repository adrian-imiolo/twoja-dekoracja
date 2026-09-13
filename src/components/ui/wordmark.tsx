import { site } from "@/lib/site";

/*
 * Never over two lines: the wordmark is one word to the brand, and its
 * letter-spacing is fixed, so on a phone the only thing that can give is its
 * size, which is the caller's, since the header and the footer set it
 * differently. `nowrap` turns any future squeeze into an overflow the suite
 * measures instead of a line break nobody notices.
 */
const STYLES =
  "font-wordmark tracking-[0.35em] whitespace-nowrap text-blush-200 uppercase";

export function Wordmark({
  /** Size only. Everything that makes it the wordmark is set here. */
  className,
}: {
  className: string;
}) {
  return <span className={`${STYLES} ${className}`}>{site.wordmark}</span>;
}
