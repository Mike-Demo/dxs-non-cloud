import { useQuery } from "@tanstack/react-query";
import { variantsQuery } from "@/lib/data/queries";
import { computeTotals, formatMoney, type Totals } from "@/lib/data/pricing";
import { useCart } from "@/lib/stores";

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

export const TotalsTable = ({ totals }: { totals: Totals }) => (
  <dl className="space-y-2 text-sm">
    <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatMoney(totals.subtotalMinor)}</dd></div>
    <div className="flex justify-between"><dt>Tax (8%)</dt><dd>{formatMoney(totals.taxMinor)}</dd></div>
    <div className="flex justify-between"><dt>Shipping</dt><dd>{totals.shippingMinor === 0 ? "Free" : formatMoney(totals.shippingMinor)}</dd></div>
    <div className="flex justify-between border-t pt-2 font-display text-lg"><dt>Total</dt><dd>{formatMoney(totals.totalMinor)}</dd></div>
  </dl>
);
