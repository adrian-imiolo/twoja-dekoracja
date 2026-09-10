import Link from "next/link";

const STYLES =
  "border border-blush-300 px-8 py-4 text-sm tracking-[0.2em] text-blush-200 uppercase transition-colors hover:bg-blush-300 hover:text-plum-950";

export function PrimaryCta({
  href,
  children,
}: {
  href: React.ComponentProps<typeof Link>["href"];
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={`inline-block ${STYLES}`}>
      {children}
    </Link>
  );
}

export function PrimaryCtaButton({
  children,
  ...rest
}: Omit<React.ComponentProps<"button">, "className">) {
  return (
    <button
      {...rest}
      className={`${STYLES} disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {children}
    </button>
  );
}
