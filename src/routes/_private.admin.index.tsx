import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MediaLibrary } from "@/components/admin/MediaLibrary";
import { contentListQuery } from "@/lib/data/queries";

const types = ["post", "product", "event", "resource"] as const;
const statuses = ["published", "draft", "scheduled", "archived"] as const;

export const Route = createFileRoute("/_private/admin/")({
  validateSearch: z.object({
    tab: z.enum(["content", "media"]).optional().catch(undefined),
    type: z.enum(types).optional().catch(undefined),
    status: z.enum(statuses).optional().catch(undefined),
    q: z.string().optional().catch(undefined),
  }),
  head: () => ({
    meta: [
      { title: "Content admin — DXS" },
      { name: "description", content: "Manage posts, products, events, resources and media." },
      { property: "og:title", content: "Content admin — DXS" },
      { property: "og:description", content: "CMS admin." },
      { name: "robots", content: "noindex" },
    ],
  }),
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(contentListQuery({ type: deps.type, status: deps.status, search: deps.q })),
  component: Admin,
});

const statusVariant = (s: string): "default" | "secondary" | "outline" => (s === "published" ? "default" : s === "archived" ? "outline" : "secondary");

function Admin() {
  const s = Route.useSearch();
  const navigate = useNavigate({ from: "/admin/" });
  const { data } = useSuspenseQuery(contentListQuery({ type: s.type, status: s.status, search: s.q }));
  const set = (patch: Partial<typeof s>) => void navigate({ search: { ...s, ...patch } });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><p className="eyebrow">CMS</p><h1 className="text-4xl">Content admin</h1></div>
        <div className="flex gap-2"><Button asChild variant="outline"><Link to="/admin/reviews">Reviews</Link></Button><Button asChild><Link to="/admin/content/$id" params={{ id: "new" }}>New content</Link></Button></div>
      </div>
      <Tabs value={s.tab ?? "content"} onValueChange={(t) => set({ tab: t === "media" ? "media" : undefined })} className="mt-6">
        <TabsList><TabsTrigger value="content">Content</TabsTrigger><TabsTrigger value="media">Media library</TabsTrigger></TabsList>
        <TabsContent value="content" className="mt-4 space-y-4">
          <div className="flex flex-wrap gap-2">
            <Input aria-label="Search content" placeholder="Search title or slug…" defaultValue={s.q ?? ""} onChange={(e) => set({ q: e.target.value || undefined })} className="max-w-xs" />
            <select aria-label="Type" className="h-9 rounded-md border bg-card px-3 text-sm" value={s.type ?? ""} onChange={(e) => set({ type: (e.target.value || undefined) as (typeof types)[number] | undefined })}>
              <option value="">All types</option>{types.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select aria-label="Status" className="h-9 rounded-md border bg-card px-3 text-sm" value={s.status ?? ""} onChange={(e) => set({ status: (e.target.value || undefined) as (typeof statuses)[number] | undefined })}>
              <option value="">All statuses</option>{statuses.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="overflow-x-auto rounded-md border bg-card">
            <Table>
              <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Type</TableHead><TableHead>Status</TableHead><TableHead>Public date</TableHead><TableHead>Updated</TableHead></TableRow></TableHeader>
              <TableBody>
                {data.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No content matches.</TableCell></TableRow>}
                {data.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="max-w-xs"><Link to="/admin/content/$id" params={{ id: c.id }} className="line-clamp-1 font-medium hover:text-primary">{c.title}</Link><span className="block font-mono text-[11px] text-muted-foreground">{c.slug}</span></TableCell>
                    <TableCell className="capitalize">{c.type}</TableCell>
                    <TableCell><Badge variant={statusVariant(c.status)}>{c.status}</Badge></TableCell>
                    <TableCell className="text-sm">{c.status === "scheduled" && c.scheduledAt ? `→ ${format(new Date(c.scheduledAt), "d MMM yyyy HH:mm")}` : c.publishedAt ? format(new Date(c.publishedAt), "d MMM yyyy") : "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{format(new Date(c.updatedAt), "d MMM yyyy")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        <TabsContent value="media" className="mt-4"><MediaLibrary /></TabsContent>
      </Tabs>
    </div>
  );
}
