import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormField } from "@/components/site/FormField";
import { buildDashboard, type DashboardRange } from "@/lib/dashboard";
import { snapshotQuery } from "@/lib/data/queries";
import { useMarkReadMutation, useSurveyMutation, useTicketMutation } from "@/lib/data/mutations";
import { formatMoney } from "@/lib/data/pricing";
import { surveySchema, ticketSchema, type SurveyInput, type TicketInput } from "@/lib/data/schemas";

const ranges = ["30d", "90d", "180d", "all"] as const;

export const Route = createFileRoute("/_private/dashboard")({
  validateSearch: z.object({ range: z.enum(ranges).optional().catch(undefined) }),
  head: () => ({
    meta: [
      { title: "Dashboard — DXS" },
      { name: "description", content: "Orders, submissions, notifications and support tickets for the demo account." },
      { property: "og:title", content: "Dashboard — DXS" },
      { property: "og:description", content: "Account dashboard." },
      { name: "robots", content: "noindex" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(snapshotQuery()),
  component: Dashboard,
});

const CHART_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"];

const Metric = ({ label, value }: { label: string; value: string }) => (
  <Card><CardContent className="p-4"><p className="eyebrow">{label}</p><p className="mt-1 font-display text-3xl">{value}</p></CardContent></Card>
);

function TicketForm() {
  const m = useTicketMutation();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<TicketInput>({ resolver: zodResolver(ticketSchema), defaultValues: { subject: "", category: "technical", priority: "normal", message: "" } });
  const onSubmit = handleSubmit(async (v) => {
    try { await m.mutateAsync(v); reset(); toast.success("Ticket opened"); } catch { toast.error("Could not open ticket"); }
  });
  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-3 sm:grid-cols-2">
      <FormField id="t-subject" label="Subject" className="sm:col-span-2" error={errors.subject?.message} {...register("subject")} />
      <div className="space-y-1"><Label htmlFor="t-cat">Category</Label><select id="t-cat" className="h-9 w-full rounded-md border bg-card px-3 text-sm" {...register("category")}><option value="technical">Technical</option><option value="content">Content</option><option value="billing">Billing</option><option value="other">Other</option></select></div>
      <div className="space-y-1"><Label htmlFor="t-pri">Priority</Label><select id="t-pri" className="h-9 w-full rounded-md border bg-card px-3 text-sm" {...register("priority")}><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option></select></div>
      <div className="space-y-1 sm:col-span-2"><Label htmlFor="t-msg">Message</Label><Textarea id="t-msg" rows={3} aria-invalid={!!errors.message} {...register("message")} />{errors.message && <p className="text-sm text-destructive">{errors.message.message}</p>}</div>
      <Button type="submit" disabled={m.isPending} className="w-fit">{m.isPending ? "Opening…" : "Open ticket"}</Button>
    </form>
  );
}

function SurveyForm({ alreadyAnswered }: { alreadyAnswered: boolean }) {
  const m = useSurveyMutation();
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitSuccessful } } = useForm<SurveyInput>({ resolver: zodResolver(surveySchema), defaultValues: { satisfaction: 0, mostUsed: "blog", comments: "" } });
  const rating = watch("satisfaction");
  const onSubmit = handleSubmit(async (v) => {
    try { await m.mutateAsync(v); toast.success("Thanks for the feedback"); } catch { toast.error("Could not save survey"); }
  });
  if (isSubmitSuccessful || alreadyAnswered) return <p className="text-sm text-muted-foreground">Survey received — thank you.</p>;
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-3">
      <fieldset>
        <legend className="mb-1 text-sm font-medium">How satisfied are you with DXS?</legend>
        <div className="flex gap-1">{[1, 2, 3, 4, 5].map((n) => <Button key={n} type="button" size="sm" variant={rating === n ? "default" : "outline"} aria-pressed={rating === n} onClick={() => setValue("satisfaction", n, { shouldValidate: true })}>{n}</Button>)}</div>
        {errors.satisfaction && <p className="text-sm text-destructive">{errors.satisfaction.message}</p>}
      </fieldset>
      <div className="space-y-1"><Label htmlFor="s-used">Most used area</Label><select id="s-used" className="h-9 w-full rounded-md border bg-card px-3 text-sm" {...register("mostUsed")}><option value="blog">Field notes</option><option value="shop">Shop</option><option value="events">Events</option><option value="resources">Resources</option></select></div>
      <div className="space-y-1"><Label htmlFor="s-c">Comments (optional)</Label><Textarea id="s-c" rows={2} {...register("comments")} /></div>
      <Button type="submit" size="sm" disabled={m.isPending}>Submit survey</Button>
    </form>
  );
}

function Dashboard() {
  const { range = "90d" } = Route.useSearch();
  const navigate = useNavigate({ from: "/dashboard" });
  const { data: snap } = useSuspenseQuery(snapshotQuery());
  const markRead = useMarkReadMutation();
  const v = buildDashboard(snap, range, new Date());

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><p className="eyebrow">Workspace</p><h1 className="text-4xl">Dashboard</h1></div>
        <Tabs value={range} onValueChange={(r) => void navigate({ search: { range: r as DashboardRange } })}>
          <TabsList>{ranges.map((r) => <TabsTrigger key={r} value={r}>{r === "all" ? "All time" : `Last ${r.replace("d", "")} days`}</TabsTrigger>)}</TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label="Revenue" value={formatMoney(v.revenueMinor)} />
        <Metric label="Orders" value={String(v.orderCount)} />
        <Metric label="Avg. order" value={formatMoney(v.averageOrderMinor)} />
        <Metric label="Submissions" value={String(v.submissionCount)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="font-display text-lg">Revenue by month</CardTitle></CardHeader>
          <CardContent className="h-64">
            {v.revenueByMonth.length === 0 ? <p className="text-sm text-muted-foreground">No orders in this range.</p> : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={v.revenueByMonth.map((m) => ({ ...m, revenue: m.revenueMinor / 100 }))}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={12} stroke="var(--muted-foreground)" />
                  <YAxis fontSize={12} stroke="var(--muted-foreground)" />
                  <Tooltip formatter={(n: number) => formatMoney(n * 100)} />
                  <Line type="monotone" dataKey="revenue" stroke="var(--chart-1)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="font-display text-lg">Content by status</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={v.contentByStatus} dataKey="count" nameKey="status" innerRadius={45} outerRadius={80} label={({ name, value }: { name: string; value: number }) => `${name} ${value}`} fontSize={11}>
                  {v.contentByStatus.map((s, i) => <Cell key={s.status} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader><CardTitle className="font-display text-lg">Orders per month</CardTitle></CardHeader>
          <CardContent className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={v.revenueByMonth}>
                <XAxis dataKey="month" fontSize={12} stroke="var(--muted-foreground)" />
                <YAxis allowDecimals={false} fontSize={12} stroke="var(--muted-foreground)" />
                <Tooltip />
                <Bar dataKey="orders" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between"><CardTitle className="font-display text-lg">Notifications ({v.unreadNotifications} unread)</CardTitle>
            <Button size="sm" variant="ghost" disabled={v.unreadNotifications === 0} onClick={() => markRead.mutate("all")}>Mark all read</Button>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {snap.notifications.map((n) => (
                <li key={n.id} className="flex items-start justify-between gap-3 py-3">
                  <div>
                    <p className={n.readAt ? "text-sm" : "text-sm font-semibold"}>{n.href ? <a href={n.href} className="hover:text-primary">{n.title}</a> : n.title}</p>
                    <p className="text-xs text-muted-foreground">{n.body} · {format(new Date(n.createdAt), "d MMM")}</p>
                  </div>
                  {!n.readAt && <Button size="sm" variant="outline" onClick={() => markRead.mutate(n.id)}>Mark read</Button>}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="font-display text-lg">Recent activity</CardTitle></CardHeader>
          <CardContent>
            {v.activity.length === 0 ? <p className="text-sm text-muted-foreground">No activity in this range.</p> : (
              <ol className="space-y-2 text-sm">{v.activity.map((a) => <li key={a.at + a.label} className="flex gap-3"><span className="w-16 shrink-0 text-muted-foreground">{format(new Date(a.at), "d MMM")}</span><span>{a.label}</span></li>)}</ol>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="font-display text-lg">Orders</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead>Order</TableHead><TableHead>Date</TableHead><TableHead>Items</TableHead><TableHead>Payment</TableHead><TableHead className="text-right">Total</TableHead></TableRow></TableHeader>
            <TableBody>
              {[...snap.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((o) => (
                <TableRow key={o.id}><TableCell className="font-mono text-xs">{o.id}</TableCell><TableCell>{format(new Date(o.createdAt), "d MMM yyyy")}</TableCell><TableCell>{o.items.map((i) => `${i.quantity}× ${i.productName}`).join(", ")}</TableCell><TableCell><Badge variant="secondary">simulated</Badge></TableCell><TableCell className="text-right">{formatMoney(o.totalMinor)}</TableCell></TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="font-display text-lg">Support tickets ({v.openTickets} open)</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <ul className="divide-y">
              {snap.tickets.map((t) => (
                <li key={t.id} className="py-3">
                  <div className="flex items-center justify-between gap-2"><p className="text-sm font-medium">{t.subject}</p><Badge variant={t.state === "resolved" ? "outline" : "default"}>{t.state}</Badge></div>
                  <p className="text-xs text-muted-foreground">{t.category} · {t.priority} priority · {t.messages.length} message(s)</p>
                </li>
              ))}
            </ul>
            <TicketForm />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="font-display text-lg">Quick survey</CardTitle></CardHeader>
          <CardContent><SurveyForm alreadyAnswered={snap.surveys.length > 0} /><p className="mt-4 text-xs text-muted-foreground">Manage content in the <Link to="/admin" className="text-primary">admin</Link>.</p></CardContent>
        </Card>
      </div>
    </div>
  );
}
