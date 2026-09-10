import Link from "next/link";

export function QuietLink({
  href,
  children,
}: {
  href: React.ComponentProps<typeof Link>["href"];
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-sm tracking-[0.25em] text-blush-300 uppercase transition-colors hover:text-blush-100"
    >
      {children}
    </Link>
  );
}
