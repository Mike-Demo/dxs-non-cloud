import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { toast } from "sonner";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useAsset } from "@/components/site/Cards";
import { FormField } from "@/components/site/FormField";
import { RichText } from "@/components/site/RichText";
import { NotFoundPanel } from "@/components/site/States";
import { authorsQuery, eventQuery } from "@/lib/data/queries";
import { useRegistrationMutation } from "@/lib/data/mutations";
import { isUpcoming } from "@/lib/data/publication";
import { registrationSchema, type RegistrationInput } from "@/lib/data/schemas";
import { orNotFound } from "@/lib/data/route-helpers";

export const Route = createFileRoute("/events/$slug")({
  loader: ({ context, params }) => orNotFound(context.queryClient.ensureQueryData(eventQuery(params.slug))),
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} — DXS Events` },
          { name: "description", content: `${loaderData.title}, ${loaderData.venue ?? "online"}.` },
          { property: "og:title", content: loaderData.title },
          { property: "og:description", content: loaderData.venue ?? "Online event" },
        ]
      : [{ title: "Event unavailable — DXS" }, { name: "robots", content: "noindex" }],
  }),
  notFoundComponent: () => <NotFoundPanel what="Event" backTo="/events" backLabel="Back to events" />,
  component: EventPage,
});

function EventPage() {
  const { slug } = Route.useParams();
  const { data: ev } = useSuspenseQuery(eventQuery(slug));
  const { data: authors = [] } = useQuery(authorsQuery());
  const hero = useAsset(ev.heroId);
  const upcoming = isUpcoming(ev.startAt, new Date());
  const m = useRegistrationMutation(ev.id);
  const [done, setDone] = useState(false);
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<RegistrationInput>({
    resolver: zodResolver(registrationSchema),
    defaultValues: { name: "", email: "", attendance: ev.venue ? "in-person" : "online" },
  });
  const onSubmit = handleSubmit(async (v) => {
    try {
      await m.mutateAsync(v);
      setDone(true);
      toast.success("You're registered");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Registration failed");
    }
  });

  return (
    <article>
      {hero && <img src={hero.path} alt={hero.alt} className="aspect-[21/8] w-full object-cover" />}
      <div className="container-page mt-10 grid gap-10 md:grid-cols-[1fr_22rem]">
        <div>
          <nav aria-label="Breadcrumb" className="eyebrow"><Link to="/events">Events</Link> / {upcoming ? "Upcoming" : "Past"}</nav>
          <h1 className="mt-2 text-4xl md:text-5xl">{ev.title}</h1>
          <p className="mt-3 text-muted-foreground">
            {format(new Date(ev.startAt), "EEEE d MMMM yyyy, HH:mm")}–{format(new Date(ev.endAt), "HH:mm")} {ev.timezone} · {ev.venue ?? <a href={ev.onlineUrl ?? "#"} rel="noopener noreferrer" className="text-primary">Online</a>}
          </p>
          <div className="mt-8"><RichText doc={ev.description} /></div>
          <h2 className="mt-10 text-2xl">Speakers</h2>
          <ul className="mt-3 space-y-1">{authors.filter((a) => ev.speakerIds.includes(a.id)).map((a) => <li key={a.id}><Link to="/authors/$slug" params={{ slug: a.slug }} className="text-primary">{a.name}</Link></li>)}</ul>
        </div>
        <aside className="h-fit rounded-md border bg-card p-5">
          <h2 className="text-xl">Register</h2>
          {!upcoming ? <p className="mt-2 text-sm text-muted-foreground">This event has ended.</p> : done ? <p className="mt-2 text-sm">Thanks — your registration is saved.</p> : (
            <form onSubmit={onSubmit} noValidate className="mt-4 space-y-4">
              <FormField id="reg-name" label="Name" error={errors.name?.message} {...register("name")} />
              <FormField id="reg-email" label="Email" type="email" error={errors.email?.message} {...register("email")} />
              <fieldset>
                <legend className="mb-2 text-sm font-medium">Attendance</legend>
                <RadioGroup value={watch("attendance")} onValueChange={(v) => setValue("attendance", v === "online" ? "online" : "in-person")}>
                  {ev.venue && <div className="flex items-center gap-2"><RadioGroupItem id="att-ip" value="in-person" /><Label htmlFor="att-ip">In person</Label></div>}
                  <div className="flex items-center gap-2"><RadioGroupItem id="att-on" value="online" /><Label htmlFor="att-on">Online</Label></div>
                </RadioGroup>
              </fieldset>
              <Button type="submit" className="w-full" disabled={m.isPending}>{m.isPending ? "Registering…" : "Register"}</Button>
            </form>
          )}
        </aside>
      </div>
    </article>
  );
}
