import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState, PageHeader } from "@/components/site/States";
import { variantsQuery } from "@/lib/data/queries";
import { computeTotals, formatMoney } from "@/lib/data/pricing";
import { useCart } from "@/lib/stores";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your cart — DXS" },
      { name: "description", content: "Review quantities and totals before the simulated checkout." },
      { property: "og:title", content: "Your cart — DXS" },
      { property: "og:description", content: "Review your cart." },
    ],
  }),
  component: Cart,
});

export const useCartView = () => {
  const lines = useCart((s) => s.lines);
  const { data: variants = [], isLoading } = useQuery(variantsQuery(lines.map((l) => l.variantId)));
  const rows = lines.flatMap((l) => {
    const v = variants.find((x) => x.id === l.variantId);
    return v ? [{ ...l, variant: v }] : [];
  });
  const totals = computeTotals(rows.map((r) => ({ unitPriceMinor: r.variant.priceMinor, quantity: r.quantity })));
  return { lines, rows, totals, isLoading };
};

export const TotalsTable = ({ totals }: { totals: ReturnType<typeof computeTotals> }) => (
  <dl className="space-y-2 text-sm">
    <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatMoney(totals.subtotalMinor)}</dd></div>
    <div className="flex justify-between"><dt>Tax (8%)</dt><dd>{formatMoney(totals.taxMinor)}</dd></div>
    <div className="flex justify-between"><dt>Shipping</dt><dd>{totals.shippingMinor === 0 ? "Free" : formatMoney(totals.shippingMinor)}</dd></div>
    <div className="flex justify-between border-t pt-2 font-display text-lg"><dt>Total</dt><dd>{formatMoney(totals.totalMinor)}</dd></div>
  </dl>
);

function Cart() {
  const { rows, totals, isLoading } = useCartView();
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);

  return (
    <>
      <PageHeader eyebrow="Cart" title="Your cart" />
      <div className="container-page mt-8">
        {!isLoading && rows.length === 0 ? (
          <EmptyState title="Your cart is empty" body="Browse the shop to add something." />
        ) : (
          <div className="grid gap-10 md:grid-cols-[1fr_20rem]">
            <ul className="divide-y border-y">
              {rows.map((r) => (
                <li key={r.variantId} className="flex flex-wrap items-center gap-4 py-4">
                  <div className="min-w-0 flex-1">
                    <Link to="/products/$slug" params={{ slug: r.variant.productSlug }} className="font-display text-lg hover:text-primary">{r.variant.productName}</Link>
                    <p className="text-sm text-muted-foreground">{Object.values(r.variant.options).join(" / ")} · {formatMoney(r.variant.priceMinor)} · {r.variant.stock} in stock</p>
                    {r.quantity > r.variant.stock && <p className="text-sm text-destructive">Only {r.variant.stock} available — reduce quantity to check out.</p>}
                  </div>
                  <Input aria-label={`Quantity for ${r.variant.productName}`} type="number" min={1} max={99} value={r.quantity} onChange={(e) => setQuantity(r.variantId, Number(e.target.value))} className="w-20" />
                  <span className="w-24 text-right">{formatMoney(r.variant.priceMinor * r.quantity)}</span>
                  <Button variant="ghost" size="icon" aria-label={`Remove ${r.variant.productName}`} onClick={() => remove(r.variantId)}><Trash2 className="size-4" /></Button>
                </li>
              ))}
            </ul>
            <aside className="h-fit rounded-md border bg-card p-5">
              <TotalsTable totals={totals} />
              <Button asChild className="mt-5 w-full" disabled={rows.some((r) => r.quantity > r.variant.stock)}>
                <Link to="/checkout">Checkout</Link>
              </Button>
            </aside>
          </div>
        )}
      </div>
    </>
  );
}
