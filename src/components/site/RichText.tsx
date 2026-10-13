import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import type { InlineNode, RichText as RichTextDoc } from "@/lib/data/models";
import { mediaQuery, productsByIdsQuery } from "@/lib/data/queries";
import { formatMoney } from "@/lib/data/pricing";

const Inline = ({ nodes }: { nodes: InlineNode[] }) => (
  <>
    {nodes.map((n, i) => {
      if (n.type === "link") {
        return n.href.startsWith("/") ? (
          <a key={i} href={n.href} className="text-primary underline underline-offset-4">{n.text}</a>
        ) : (
          <a key={i} href={n.href} rel="noopener noreferrer" target="_blank" className="text-primary underline underline-offset-4">{n.text}</a>
        );
      }
      let el: React.ReactNode = n.text;
      if (n.marks?.includes("code")) el = <code className="rounded bg-muted px-1 font-mono text-sm">{el}</code>;
      if (n.marks?.includes("italic")) el = <em>{el}</em>;
      if (n.marks?.includes("bold")) el = <strong>{el}</strong>;
      return <span key={i}>{el}</span>;
    })}
  </>
);

const ProductEmbed = ({ id }: { id: string }) => {
  const { data } = useQuery(productsByIdsQuery([id]));
  const p = data?.[0];
  if (!p) return null;
  return (
    <Link to="/products/$slug" params={{ slug: p.slug }} className="not-prose my-6 flex items-center justify-between rounded-md border bg-card p-4 hover:border-primary">
      <span className="font-display text-lg">{p.name}</span>
      <span className="text-sm text-muted-foreground">from {formatMoney(p.fromPriceMinor)}</span>
    </Link>
  );
};

/** Safe structured rich-text renderer: never injects HTML. */
export const RichText = ({ doc }: { doc: RichTextDoc }) => {
  const { data: media = [] } = useQuery(mediaQuery());
  return (
    <div className="space-y-5 text-base leading-relaxed">
      {doc.map((node, i) => {
        switch (node.type) {
          case "heading":
            return node.level === 2 ? <h2 key={i} className="pt-4 text-2xl">{node.text}</h2> : <h3 key={i} className="pt-2 text-xl">{node.text}</h3>;
          case "paragraph":
            return <p key={i}><Inline nodes={node.children} /></p>;
          case "list": {
            const items = node.items.map((it, j) => <li key={j}><Inline nodes={it} /></li>);
            return node.ordered ? <ol key={i} className="list-decimal space-y-1 pl-6">{items}</ol> : <ul key={i} className="list-disc space-y-1 pl-6">{items}</ul>;
          }
          case "quote":
            return (
              <blockquote key={i} className="border-l-4 border-primary pl-4 font-display text-xl italic">
                {node.text}
                {node.cite && <footer className="mt-1 font-sans text-sm not-italic text-muted-foreground">— {node.cite}</footer>}
              </blockquote>
            );
          case "code":
            return <pre key={i} className="overflow-x-auto rounded-md bg-ink p-4 font-mono text-sm text-paper"><code>{node.code}</code></pre>;
          case "image": {
            const a = media.find((m) => m.id === node.assetId);
            if (!a) return null;
            return (
              <figure key={i}>
                <img src={a.path} alt={a.alt} width={a.width ?? undefined} height={a.height ?? undefined} loading="lazy" className="w-full rounded-md" />
                {a.caption && <figcaption className="mt-2 text-sm text-muted-foreground">{a.caption}</figcaption>}
              </figure>
            );
          }
          case "embed":
            return node.refType === "product" ? <ProductEmbed key={i} id={node.refId} /> : null;
        }
      })}
    </div>
  );
};
