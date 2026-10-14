import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useAsset } from "@/components/site/Cards";
import { RichText } from "@/components/site/RichText";
import { PageHeader } from "@/components/site/States";
import type { TeamMember } from "@/lib/data/models";
import { faqsQuery, storiesQuery, teamQuery } from "@/lib/data/queries";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — DXS" },
      { name: "description", content: "The team behind DXS, customer stories and frequently asked questions." },
      { property: "og:title", content: "About — DXS" },
      { property: "og:description", content: "Team, customer stories and FAQ." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(teamQuery()),
  component: About,
});

const Member = ({ m }: { m: TeamMember }) => {
  const p = useAsset(m.portraitId);
  return (
    <li>
      {p && <img src={p.path} alt={p.alt} loading="lazy" className="aspect-square w-full rounded-md object-cover" />}
      <p className="mt-3 font-display text-xl">{m.name}</p>
      <p className="eyebrow">{m.role}</p>
      <p className="mt-1 text-sm text-muted-foreground">{m.bio}</p>
    </li>
  );
};

function About() {
  const { data: team } = useSuspenseQuery(teamQuery());
  const { data: stories = [] } = useQuery(storiesQuery());
  const { data: faqs = [] } = useQuery(faqsQuery());
  return (
    <>
      <PageHeader eyebrow="About" title="We build the site you migrate" intro="DXS exists so migration teams can compare source data, migrated data and rendered pages with confidence." />
      <section className="container-page mt-12"><h2 className="mb-6 text-2xl">Team</h2><ul className="grid gap-8 sm:grid-cols-3">{team.map((m) => <Member key={m.id} m={m} />)}</ul></section>
      {stories.map((s) => (
        <section key={s.id} className="container-page rule-top mt-16 max-w-3xl pt-5">
          <p className="eyebrow">Customer story · {s.company}</p>
          <h2 className="mt-2 text-3xl">{s.title}</h2>
          <div className="mt-6"><RichText doc={s.body} /></div>
        </section>
      ))}
      <section className="container-page mt-16 max-w-3xl">
        <h2 className="text-2xl">FAQ</h2>
        <Accordion type="single" collapsible className="mt-4">
          {faqs.map((f) => (
            <AccordionItem key={f.id} value={f.id}><AccordionTrigger>{f.question}</AccordionTrigger><AccordionContent><RichText doc={f.answer} /></AccordionContent></AccordionItem>
          ))}
        </Accordion>
      </section>
    </>
  );
}
