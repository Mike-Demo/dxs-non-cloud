import type { ContentSummary, PublicationStatus } from "./data/models";
import type { PrivateSnapshot } from "./data/private-ops";

export type DashboardRange = "30d" | "90d" | "180d" | "all";

export const RANGE_DAYS: Record<DashboardRange, number | null> = { "30d": 30, "90d": 90, "180d": 180, all: null };

export interface DashboardView {
  revenueMinor: number;
  orderCount: number;
  averageOrderMinor: number;
  submissionCount: number;
  unreadNotifications: number;
  openTickets: number;
  revenueByMonth: { month: string; revenueMinor: number; orders: number }[];
  contentByStatus: { status: PublicationStatus; count: number }[];
  activity: { at: string; label: string }[];
}

const inRange = (iso: string, now: Date, days: number | null): boolean =>
  days === null || now.getTime() - new Date(iso).getTime() <= days * 86_400_000;

/** Derives all dashboard widgets from repository data for a date range ending at `now`. */
export const buildDashboard = (s: PrivateSnapshot, range: DashboardRange, now: Date): DashboardView => {
  const days = RANGE_DAYS[range];
  const orders = s.orders.filter((o) => inRange(o.createdAt, now, days));
  const revenueMinor = orders.reduce((n, o) => n + o.totalMinor, 0);
  const months = new Map<string, { revenueMinor: number; orders: number }>();
  for (const o of [...orders].sort((a, b) => a.createdAt.localeCompare(b.createdAt))) {
    const key = o.createdAt.slice(0, 7);
    const m = months.get(key) ?? { revenueMinor: 0, orders: 0 };
    months.set(key, { revenueMinor: m.revenueMinor + o.totalMinor, orders: m.orders + 1 });
  }
  const submissions = [...s.contactSubmissions, ...s.newsletter, ...s.registrations, ...s.applications, ...s.surveys, ...s.feedback].filter((x) => inRange(x.createdAt, now, days));
  const statuses: PublicationStatus[] = ["published", "draft", "scheduled", "archived"];
  const count = (st: PublicationStatus, c: ContentSummary[]): number => c.filter((x) => x.status === st).length;
  const activity = [
    ...orders.map((o) => ({ at: o.createdAt, label: `Order ${o.id} · ${o.items.map((i) => i.productName).join(", ")}` })),
    ...s.registrations.map((r) => ({ at: r.createdAt, label: `Event registration · ${r.name}` })),
    ...s.contactSubmissions.map((c) => ({ at: c.createdAt, label: `Contact message · ${c.topic}` })),
    ...s.tickets.map((t) => ({ at: t.updatedAt, label: `Ticket ${t.state} · ${t.subject}` })),
  ]
    .filter((a) => inRange(a.at, now, days))
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 8);

  return {
    revenueMinor,
    orderCount: orders.length,
    averageOrderMinor: orders.length ? Math.round(revenueMinor / orders.length) : 0,
    submissionCount: submissions.length,
    unreadNotifications: s.notifications.filter((n) => !n.readAt).length,
    openTickets: s.tickets.filter((t) => t.state !== "resolved").length,
    revenueByMonth: [...months.entries()].map(([month, v]) => ({ month, ...v })),
    contentByStatus: statuses.map((st) => ({ status: st, count: count(st, s.content) })),
    activity,
  };
};
