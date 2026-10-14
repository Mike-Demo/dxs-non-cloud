import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { InlineNode, MediaAsset, RichNode, RichText } from "@/lib/data/models";

const inlineText = (nodes: InlineNode[]): string => nodes.map((n) => n.text).join("");

/** Editing a paragraph collapses its inline nodes only when its text actually changes, preserving marks/links otherwise. */
const setInline = (prev: InlineNode[], text: string): InlineNode[] => (inlineText(prev) === text ? prev : [{ type: "text", text }]);

const blank: Record<"paragraph" | "heading" | "quote" | "code" | "list" | "image", () => RichNode> = {
  paragraph: () => ({ type: "paragraph", children: [{ type: "text", text: "" }] }),
  heading: () => ({ type: "heading", level: 2, text: "" }),
  quote: () => ({ type: "quote", text: "", cite: null }),
  code: () => ({ type: "code", language: "ts", code: "" }),
  list: () => ({ type: "list", ordered: false, items: [[{ type: "text", text: "" }]] }),
  image: () => ({ type: "image", assetId: "" }),
};

interface Props {
  value: RichText;
  onChange: (v: RichText) => void;
  media: MediaAsset[];
}

export const BlockEditor = ({ value, onChange, media }: Props) => {
  const update = (i: number, node: RichNode): void => onChange(value.map((n, j) => (j === i ? node : n)));
  const move = (i: number, d: -1 | 1): void => {
    const j = i + d;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    const a = next[i];
    const b = next[j];
    if (!a || !b) return;
    next[i] = b;
    next[j] = a;
    onChange(next);
  };

  const field = (node: RichNode, i: number) => {
    switch (node.type) {
      case "paragraph":
        return <Textarea aria-label={`Paragraph ${i + 1}`} rows={3} value={inlineText(node.children)} onChange={(e) => update(i, { ...node, children: setInline(node.children, e.target.value) })} />;
      case "heading":
        return (
          <div className="flex gap-2">
            <select aria-label="Heading level" className="h-9 rounded-md border bg-card px-2 text-sm" value={node.level} onChange={(e) => update(i, { ...node, level: e.target.value === "3" ? 3 : 2 })}><option value="2">H2</option><option value="3">H3</option></select>
            <Input aria-label={`Heading ${i + 1}`} value={node.text} onChange={(e) => update(i, { ...node, text: e.target.value })} />
          </div>
        );
      case "quote":
        return (
          <div className="space-y-2">
            <Textarea aria-label="Quote text" rows={2} value={node.text} onChange={(e) => update(i, { ...node, text: e.target.value })} />
            <Input aria-label="Citation" placeholder="Citation (optional)" value={node.cite ?? ""} onChange={(e) => update(i, { ...node, cite: e.target.value || null })} />
          </div>
        );
      case "code":
        return (
          <div className="space-y-2">
            <Input aria-label="Language" className="w-32" value={node.language} onChange={(e) => update(i, { ...node, language: e.target.value })} />
            <Textarea aria-label="Code" rows={4} className="font-mono text-xs" value={node.code} onChange={(e) => update(i, { ...node, code: e.target.value })} />
          </div>
        );
      case "list":
        return (
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={node.ordered} onChange={(e) => update(i, { ...node, ordered: e.target.checked })} /> Numbered</label>
            <Textarea aria-label="List items, one per line" rows={3} value={node.items.map(inlineText).join("\n")} onChange={(e) => {
              const lines = e.target.value.split("\n");
              update(i, { ...node, items: lines.map((l, k) => setInline(node.items[k] ?? [], l)) });
            }} />
          </div>
        );
      case "image":
        return (
          <select aria-label="Image asset" className="h-9 w-full rounded-md border bg-card px-2 text-sm" value={node.assetId} onChange={(e) => update(i, { ...node, assetId: e.target.value })}>
            <option value="">Choose an image…</option>
            {media.map((m) => <option key={m.id} value={m.id}>{m.alt}</option>)}
          </select>
        );
      case "embed":
        return <p className="text-sm text-muted-foreground">Embedded {node.refType} reference: <code className="font-mono">{node.refId}</code></p>;
    }
  };

  return (
    <div className="space-y-3">
      {value.map((node, i) => (
        <div key={i} className="rounded-md border bg-card p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="eyebrow">{node.type}</span>
            <div className="flex gap-1">
              <Button type="button" size="icon" variant="ghost" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp className="size-4" /></Button>
              <Button type="button" size="icon" variant="ghost" aria-label="Move down" disabled={i === value.length - 1} onClick={() => move(i, 1)}><ArrowDown className="size-4" /></Button>
              <Button type="button" size="icon" variant="ghost" aria-label="Remove block" onClick={() => onChange(value.filter((_, j) => j !== i))}><Trash2 className="size-4" /></Button>
            </div>
          </div>
          {field(node, i)}
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(blank) as (keyof typeof blank)[]).map((k) => (
          <Button key={k} type="button" size="sm" variant="outline" onClick={() => onChange([...value, blank[k]()])} className="capitalize">+ {k}</Button>
        ))}
      </div>
    </div>
  );
};
