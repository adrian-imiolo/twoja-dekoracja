import Link from "next/link";

const STYLES =
  "text-sm tracking-[0.25em] text-blush-300 uppercase transition-colors hover:text-blush-100";

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
