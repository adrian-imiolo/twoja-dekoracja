const STYLES = "border border-plum-800 bg-plum-900";

/**
 * A block set apart from the prose around it, on the lighter plum ground.
 *
 * It owns the two colour classes and deliberately nothing else. Every panel on
 * the site differs in element, width, alignment and padding, because each one
 * is spaced against a different page — the closing invitation on the homepage
 * is a tier larger than the one ending `/o-nas`, and the FAQ's sits in a
 * left-aligned column rather than centred. Those belong to the page that knows
 * what it is spacing the panel against; what belongs here is that a change to
 * the palette moves all of them together.
 *
 * The inquiry form's success panel is the same box with a blush border and is
 * deliberately not built from this. There the border colour is the signal that
 * the message got out, not a style choice, and a `tone` prop would file it
 * next to decisions that are merely cosmetic.
 */
export function CalloutPanel({
  as: Tag = "div",
  className,
  children,
}: {
  /** The element the surrounding page needs. Defaults to `div`. */
  as?: "div" | "section" | "p";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Tag className={className ? `${STYLES} ${className}` : STYLES}>
      {children}
    </Tag>
  );
}
