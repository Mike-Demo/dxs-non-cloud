import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageSkeleton } from "@/components/site/States";
import { useModerateReviewMutation } from "@/lib/data/mutations";
import { reviewsQuery } from "@/lib/data/queries";

type Moderation = "approved" | "pending" | "rejected";

export const Route = createFileRoute("/_private/admin/reviews")({
  head: () => ({
    meta: [
      { title: "Review moderation — DXS CMS Testbed" },
      { name: "description", content: "Approve or reject customer product reviews before they appear publicly." },
      { property: "og:title", content: "Review moderation — DXS CMS Testbed" },
      { property: "og:description", content: "Approve or reject customer product reviews." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ReviewsPage,
});

function ReviewsPage() {
  const [filter, setFilter] = useState<Moderation>("pending");
  const q = useQuery(reviewsQuery(filter));
  const m = useModerateReviewMutation();
  const act = async (id: string, moderation: Moderation): Promise<void> => {
    try { await m.mutateAsync({ id, moderation }); toast.success(`Review ${moderation}`); } catch { toast.error("Could not update review"); }
  };
  return (
    <div className="space-y-6">
      <div>
        <nav aria-label="Breadcrumb" className="eyebrow"><Link to="/admin">Admin</Link> / reviews</nav>
        <h1 className="mt-1 text-3xl">Review moderation</h1>
        <p className="text-sm text-muted-foreground">Only approved reviews appear on product pages.</p>
      </div>
      <div role="tablist" className="flex gap-2">
        {(["pending", "approved", "rejected"] as const).map((f) => (
          <Button key={f} role="tab" aria-selected={filter === f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)} className="capitalize">{f}</Button>
        ))}
      </div>
      {q.isPending ? <PageSkeleton /> : q.data && q.data.length === 0 ? (
        <p className="rounded-md border bg-paper p-6 text-center text-muted-foreground">No {filter} reviews.</p>
      ) : (
        <ul className="space-y-3">
          {q.data?.map((r) => (
            <li key={r.id} className="rounded-md border bg-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{r.productName} · <span aria-label={`${r.rating} of 5`}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span></p>
                <Badge variant="outline" className="capitalize">{r.moderation}</Badge>
              </div>
              <p className="mt-1 font-display text-lg">{r.title}</p>
              <p className="text-sm text-muted-foreground">{r.body}</p>
              <p className="mt-1 text-xs text-muted-foreground">{r.authorName} · {new Date(r.createdAt).toLocaleDateString()}</p>
              <div className="mt-3 flex gap-2">
                {r.moderation !== "approved" && <Button size="sm" disabled={m.isPending} onClick={() => void act(r.id, "approved")}>Approve</Button>}
                {r.moderation !== "rejected" && <Button size="sm" variant="outline" disabled={m.isPending} onClick={() => void act(r.id, "rejected")}>Reject</Button>}
                {r.moderation !== "pending" && <Button size="sm" variant="ghost" disabled={m.isPending} onClick={() => void act(r.id, "pending")}>Back to pending</Button>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
