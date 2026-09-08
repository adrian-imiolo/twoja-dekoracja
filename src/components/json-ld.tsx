/**
 * A block of schema.org data, in the one form a search engine reads.
 *
 * JSON-LD sits in the document as a script the browser never runs, which is
 * why it has to be injected as raw text rather than rendered as children:
 * React would escape the JSON into something no parser can read back.
 *
 * `<` is escaped on the way in. Not because the site's own copy contains any —
 * it is Polish prose written in this repo — but because the failure mode is
 * out of all proportion to the cost of preventing it. A `</script` appearing
 * anywhere inside the JSON ends the block early and drops whatever follows
 * into the page as markup, and the escape makes that impossible for any string
 * this ever carries.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
