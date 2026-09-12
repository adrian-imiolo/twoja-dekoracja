import Link from "next/link";

/*
 * Padded above and below with the padding taken back as margin, so the link
 * is a 36px target for a thumb while the line it sits on stays the height of
 * its text. One line of small caps is 20px, and WCAG 2.5.8's floor is 24;
 * the margin trick is what lets the header row, a paragraph and the footer's
 * stack all keep their rhythm without each remembering the target on its own.
 */
const STYLES =
  "-my-2 inline-block py-2 text-sm tracking-[0.25em] text-blush-300 uppercase transition-colors hover:text-blush-100";

export function QuietLink({
  href,
  className,
  children,
}: {
  href: React.ComponentProps<typeof Link>["href"];
  /*
   * Layout only — how the link sits, never how it reads. The header lays these
   * in a row and the footer stacks them with room to tap, and the colour and
   * tracking that make them the same link stay here.
   */
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={className ? `${STYLES} ${className}` : STYLES}>
      {children}
    </Link>
  );
}
