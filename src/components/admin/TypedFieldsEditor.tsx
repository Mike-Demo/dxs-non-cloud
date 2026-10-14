import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Event, Product, Resource } from "@/lib/data/models";
import { productVariantsAdminQuery } from "@/lib/data/queries";
import type { EventFieldsInput, ProductFieldsInput, ResourceFieldsInput } from "@/lib/data/schemas";

const selectCls = "h-9 w-full rounded-md border bg-card px-2 text-sm";

const toLocal = (iso: string): string => {
  const d = new Date(iso);
  const p = (n: number): string => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

export const eventDefaults = (e: Event): EventFieldsInput => ({
  startAt: e.startAt, endAt: e.endAt, venue: e.venue ?? "", onlineUrl: e.onlineUrl ?? "", capacity: e.capacity, registrationOpen: e.registrationOpen,
});
export const resourceDefaults = (r: Resource): ResourceFieldsInput => ({ type: r.type, summary: r.summary, access: r.access });

export function ProductFieldsEditor({ product, value, onChange }: { product: Product; value: ProductFieldsInput | null; onChange: (v: ProductFieldsInput) => void }) {
  const q = useQuery(productVariantsAdminQuery(product.id));
  useEffect(() => {
    if (!value && q.data) onChange({ availability: product.availability, variants: q.data.map((v) => ({ id: v.id, priceMinor: v.priceMinor, stock: v.stock })) });
  }, [q.data, value, product.availability, onChange]);
  if (!value || !q.data) return <p className="text-sm text-muted-foreground">Loading variants…</p>;
  const setVariant = (id: string, patch: Partial<{ priceMinor: number; stock: number }>): void =>
    onChange({ ...value, variants: value.variants.map((v) => (v.id === id ? { ...v, ...patch } : v)) });
  return (
    <fieldset className="space-y-4 rounded-md border bg-paper p-4">
      <legend className="px-1 font-display text-lg">Product</legend>
      <div className="max-w-xs space-y-1">
        <Label htmlFor="availability">Availability</Label>
        <select id="availability" className={selectCls} value={value.availability} onChange={(e) => onChange({ ...value, availability: e.target.value as ProductFieldsInput["availability"] })}>
          <option value="available">Available</option><option value="preorder">Pre-order</option><option value="discontinued">Discontinued</option>
        </select>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium">Variants</p>
        {q.data.map((v) => {
          const cur = value.variants.find((x) => x.id === v.id);
          if (!cur) return null;
          return (
            <div key={v.id} className="grid grid-cols-1 items-end gap-2 rounded border bg-card p-2 sm:grid-cols-[1fr_8rem_6rem]">
              <div className="text-sm"><span className="font-mono text-xs">{v.sku}</span> <span className="text-muted-foreground">{Object.values(v.options).join(" / ")}</span></div>
              <div className="space-y-1"><Label htmlFor={`p-${v.id}`} className="text-xs">Price (USD)</Label><Input id={`p-${v.id}`} type="number" min={0} step="0.01" value={(cur.priceMinor / 100).toString()} onChange={(e) => setVariant(v.id, { priceMinor: Math.round(Number(e.target.value) * 100) })} /></div>
              <div className="space-y-1"><Label htmlFor={`s-${v.id}`} className="text-xs">Stock</Label><Input id={`s-${v.id}`} type="number" min={0} step={1} value={cur.stock} onChange={(e) => setVariant(v.id, { stock: Number(e.target.value) })} /></div>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}

export function EventFieldsEditor({ value, onChange }: { value: EventFieldsInput; onChange: (v: EventFieldsInput) => void }) {
  const setDate = (k: "startAt" | "endAt", s: string): void => onChange({ ...value, [k]: s ? new Date(s).toISOString() : "" });
  return (
    <fieldset className="rounded-md border bg-paper p-4">
      <legend className="px-1 font-display text-lg">Event</legend>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1"><Label htmlFor="startAt">Starts</Label><Input id="startAt" type="datetime-local" defaultValue={value.startAt ? toLocal(value.startAt) : ""} onChange={(e) => setDate("startAt", e.target.value)} /></div>
        <div className="space-y-1"><Label htmlFor="endAt">Ends</Label><Input id="endAt" type="datetime-local" defaultValue={value.endAt ? toLocal(value.endAt) : ""} onChange={(e) => setDate("endAt", e.target.value)} /></div>
        <div className="space-y-1"><Label htmlFor="venue">Venue</Label><Input id="venue" value={value.venue} onChange={(e) => onChange({ ...value, venue: e.target.value })} /></div>
        <div className="space-y-1"><Label htmlFor="onlineUrl">Online URL</Label><Input id="onlineUrl" type="url" value={value.onlineUrl} onChange={(e) => onChange({ ...value, onlineUrl: e.target.value })} /></div>
        <div className="space-y-1"><Label htmlFor="capacity">Capacity</Label><Input id="capacity" type="number" min={1} value={value.capacity} onChange={(e) => onChange({ ...value, capacity: Number(e.target.value) })} /></div>
        <div className="flex items-center gap-2 pt-6"><Checkbox id="regOpen" checked={value.registrationOpen} onCheckedChange={(c) => onChange({ ...value, registrationOpen: c === true })} /><Label htmlFor="regOpen">Registration open</Label></div>
      </div>
    </fieldset>
  );
}

export function ResourceFieldsEditor({ value, onChange }: { value: ResourceFieldsInput; onChange: (v: ResourceFieldsInput) => void }) {
  return (
    <fieldset className="rounded-md border bg-paper p-4">
      <legend className="px-1 font-display text-lg">Resource</legend>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1"><Label htmlFor="rtype">Type</Label>
          <select id="rtype" className={selectCls} value={value.type} onChange={(e) => onChange({ ...value, type: e.target.value as ResourceFieldsInput["type"] })}>
            <option value="guide">Guide</option><option value="whitepaper">Whitepaper</option><option value="video">Video</option><option value="download">Download</option>
          </select></div>
        <div className="space-y-1"><Label htmlFor="access">Access</Label>
          <select id="access" className={selectCls} value={value.access} onChange={(e) => onChange({ ...value, access: e.target.value as ResourceFieldsInput["access"] })}>
            <option value="public">Public</option><option value="email-gated">Email-gated</option>
          </select></div>
        <div className="space-y-1 sm:col-span-2"><Label htmlFor="summary">Summary</Label><Textarea id="summary" maxLength={300} value={value.summary} onChange={(e) => onChange({ ...value, summary: e.target.value })} /></div>
      </div>
    </fieldset>
  );
}
