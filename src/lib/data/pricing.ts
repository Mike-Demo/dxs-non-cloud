/** Placeholder commerce rules for the simulated checkout (demo values, not real tax advice). */
export const TAX_RATE_BASIS_POINTS = 800; // 8%
export const FLAT_SHIPPING_MINOR = 800; // $8.00
export const FREE_SHIPPING_THRESHOLD_MINOR = 10_000; // $100.00

export interface Totals {
  subtotalMinor: number;
  taxMinor: number;
  shippingMinor: number;
  totalMinor: number;
}

export const computeTotals = (lines: { unitPriceMinor: number; quantity: number }[]): Totals => {
  const subtotalMinor = lines.reduce((sum, l) => sum + l.unitPriceMinor * l.quantity, 0);
  const taxMinor = Math.round((subtotalMinor * TAX_RATE_BASIS_POINTS) / 10_000);
  const shippingMinor = subtotalMinor === 0 || subtotalMinor >= FREE_SHIPPING_THRESHOLD_MINOR ? 0 : FLAT_SHIPPING_MINOR;
  return { subtotalMinor, taxMinor, shippingMinor, totalMinor: subtotalMinor + taxMinor + shippingMinor };
};

export const formatMoney = (minor: number, currency = "USD"): string =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(minor / 100);
