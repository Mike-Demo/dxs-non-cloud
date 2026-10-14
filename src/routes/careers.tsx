import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/site/FormField";
import { PageHeader } from "@/components/site/States";
import { jobsQuery } from "@/lib/data/queries";
import { useApplicationMutation } from "@/lib/data/mutations";
import { applicationSchema, MAX_RESUME_BYTES, RESUME_TYPES, type ApplicationInput } from "@/lib/data/schemas";

export const Route = createFileRoute("/careers")({
  validateSearch: z.object({ job: z.string().optional().catch(undefined) }),
  head: () => ({
    meta: [
      { title: "Careers — DXS" },
      { name: "description", content: "Open roles on the DXS team and how to apply." },
      { property: "og:title", content: "Careers — DXS" },
      { property: "og:description", content: "Open roles at DXS." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(jobsQuery()),
  component: Careers,
});

function Careers() {
  const { data: jobs } = useSuspenseQuery(jobsQuery());
  const { job: jobSlug } = Route.useSearch();
  const navigate = useNavigate({ from: "/careers" });
  const job = jobs.find((j) => j.slug === jobSlug) ?? jobs[0];
  const m = useApplicationMutation();
  const [sent, setSent] = useState<string | null>(null);
  const { register, handleSubmit, setValue, setError, watch, reset, formState: { errors } } = useForm<ApplicationInput>({
    resolver: zodResolver(applicationSchema),
    defaultValues: { name: "", email: "", portfolioUrl: "", coverLetter: "", resumeFileName: "", consent: false as unknown as true },
  });

  const onFile = (f: File | undefined): void => {
    if (!f) return setValue("resumeFileName", "");
    if (!RESUME_TYPES.includes(f.type)) return setError("resumeFileName", { message: "Use a PDF or Word document" });
    if (f.size > MAX_RESUME_BYTES) return setError("resumeFileName", { message: "File must be 5 MB or smaller" });
    setValue("resumeFileName", f.name, { shouldValidate: true });
  };

  const onSubmit = handleSubmit(async (input) => {
    if (!job) return;
    try {
      await m.mutateAsync({ jobId: job.id, input });
      setSent(job.title);
      reset();
      toast.success("Application received");
    } catch {
      toast.error("Could not submit your application");
    }
  });

  return (
    <>
      <PageHeader eyebrow="Careers" title="Work on the testbed" intro={`${jobs.length} open roles.`} />
      <div className="container-page mt-10 grid gap-10 md:grid-cols-[18rem_1fr]">
        <ul className="space-y-1" aria-label="Open roles">
          {jobs.map((j) => (
            <li key={j.id}>
              <button onClick={() => { setSent(null); void navigate({ search: { job: j.slug } }); }} aria-current={j.id === job?.id} className={j.id === job?.id ? "w-full rounded-md bg-accent p-3 text-left" : "w-full rounded-md p-3 text-left hover:bg-muted"}>
                <span className="block font-display text-lg">{j.title}</span>
                <span className="text-sm text-muted-foreground">{j.department} · {j.location}</span>
              </button>
            </li>
          ))}
        </ul>
        {job && (
          <section>
            <h2 className="text-3xl">{job.title}</h2>
            <p className="mt-2 text-muted-foreground">{job.description}</p>
            {sent ? <p className="mt-8 rounded-md border bg-card p-5">Thanks — your application for <strong>{sent}</strong> was received.</p> : (
              <form onSubmit={onSubmit} noValidate className="mt-8 grid gap-4 sm:grid-cols-2">
                <FormField id="app-name" label="Name" error={errors.name?.message} {...register("name")} />
                <FormField id="app-email" label="Email" type="email" error={errors.email?.message} {...register("email")} />
                <FormField id="app-url" label="Portfolio URL (optional)" className="sm:col-span-2" error={errors.portfolioUrl?.message} {...register("portfolioUrl")} />
                <div className="space-y-1 sm:col-span-2">
                  <Label htmlFor="app-cover">Cover letter</Label>
                  <Textarea id="app-cover" rows={6} aria-invalid={!!errors.coverLetter} {...register("coverLetter")} />
                  {errors.coverLetter && <p className="text-sm text-destructive">{errors.coverLetter.message}</p>}
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label htmlFor="app-resume">Résumé (PDF or Word, max 5 MB)</Label>
                  <input id="app-resume" type="file" accept=".pdf,.doc,.docx" onChange={(e) => onFile(e.target.files?.[0])} className="block text-sm" />
                  {errors.resumeFileName && <p className="text-sm text-destructive">{errors.resumeFileName.message}</p>}
                </div>
                <div className="flex items-start gap-2 sm:col-span-2">
                  <Checkbox id="app-consent" checked={watch("consent") === true} onCheckedChange={(c) => setValue("consent", (c === true) as true, { shouldValidate: true })} />
                  <Label htmlFor="app-consent" className="font-normal">I consent to DXS storing my application for this role.</Label>
                </div>
                {errors.consent && <p className="text-sm text-destructive sm:col-span-2">{errors.consent.message}</p>}
                <div className="sm:col-span-2"><Button type="submit" disabled={m.isPending}>{m.isPending ? "Sending…" : "Submit application"}</Button></div>
              </form>
            )}
          </section>
        )}
      </div>
    </>
  );
}
