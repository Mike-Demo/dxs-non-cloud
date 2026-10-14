import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventCard } from "@/components/site/Cards";
import { EmptyState, PageHeader } from "@/components/site/States";
import { eventsQuery } from "@/lib/data/queries";

const searchSchema = z.object({ when: z.enum(["upcoming", "past"]).optional().catch(undefined) });

export const Route = createFileRoute("/events/")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Events — DXS" },
      { name: "description", content: "Upcoming and past DXS summits, workshops and webinars." },
      { property: "og:title", content: "Events — DXS" },
      { property: "og:description", content: "Summits, workshops and webinars." },
    ],
  }),
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(eventsQuery(deps.when ?? "upcoming")),
  component: Events,
});

function Events() {
  const { when = "upcoming" } = Route.useSearch();
  const navigate = useNavigate({ from: "/events/" });
  const { data } = useSuspenseQuery(eventsQuery(when));
  return (
    <>
      <PageHeader eyebrow="Events" title="Meet the people doing migrations" />
      <div className="container-page mt-8">
        <Tabs value={when} onValueChange={(v) => void navigate({ search: { when: v === "past" ? "past" : undefined } })}>
          <TabsList><TabsTrigger value="upcoming">Upcoming</TabsTrigger><TabsTrigger value="past">Past</TabsTrigger></TabsList>
        </Tabs>
        <div className="mt-6">{data.length === 0 ? <EmptyState title={`No ${when} events`} body="Check back soon." /> : data.map((e) => <EventCard key={e.id} event={e} />)}</div>
      </div>
    </>
  );
}
