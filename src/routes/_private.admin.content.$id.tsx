import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BlockEditor } from "@/components/admin/BlockEditor";
import { EventFieldsEditor, ProductFieldsEditor, ResourceFieldsEditor, eventDefaults, resourceDefaults } from "@/components/admin/TypedFieldsEditor";
import { FormField } from "@/components/site/FormField";
import { NotFoundPanel, PageSkeleton } from "@/components/site/States";
import { RichText } from "@/components/site/RichText";
import type { BlogPost, ContentType, RichText as RichTextDoc } from "@/lib/data/models";
import type { ContentRecord } from "@/lib/data/private-ops";
import { authorsQuery, categoriesQuery, contentListQuery, contentQuery, mediaQuery, tagsQuery } from "@/lib/data/queries";
import { useCreateContentMutation, useDeleteContentMutation, useSaveContentMutation } from "@/lib/data/mutations";
import { NotFoundError } from "@/lib/data/repository";
import { commonContentSchema, type CommonContentInput, type EventFieldsInput, type PostFieldsInput, type ProductFieldsInput, type ResourceFieldsInput, eventFieldsSchema, productFieldsSchema, resourceFieldsSchema, type TypedFields } from "@/lib/data/schemas";

export const Route = createFileRoute("/_private/admin/content/$id")({
  head: () => ({
    meta: [
      { title: "Edit content — DXS admin" },
      { name: "description", content: "Typed editor for DXS content." },
      { property: "og:title", content: "Edit content — DXS admin" },
      { property: "og:description", content: "Content editor." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EditorRoute,
});

const toLocalInput = (iso: string | null): string => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number): string => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

function NewContent() {
  const m = useCreateContentMutation();
  const navigate = useNavigate();
  const create = async (type: ContentType): Promise<void> => {
    try {
      const { id } = await m.mutateAsync(type);
      void navigate({ to: "/admin/content/$id", params: { id } });
    } catch { toast.error("Could not create content"); }
  };
  return (
    <div>
      <p className="eyebrow">New content</p>
      <h1 className="text-4xl">What are you creating?</h1>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {(["post", "product", "event", "resource"] as const).map((t) => (
          <Button key={t} variant="outline" className="h-20 justify-start text-lg capitalize" disabled={m.isPending} onClick={() => void create(t)}>{t}</Button>
        ))}
      </div>
    </div>
  );
}

const titleOf = (c: ContentRecord): string => (c.type === "product" ? c.record.name : c.record.title);
const publicPath = (c: ContentRecord): string => ({ post: "/blog/", product: "/products/", event: "/events/", resource: "/resources/" } as const)[c.type] + c.record.slug;

const MultiPick = ({ label, options, value, onChange }: { label: string; options: { id: string; name: string }[]; value: string[]; onChange: (v: string[]) => void }) => (
  <fieldset>
    <legend className="mb-1 text-sm font-medium">{label}</legend>
    <div className="max-h-40 space-y-1 overflow-y-auto rounded-md border bg-card p-2">
      {options.map((o) => (
        <label key={o.id} className="flex items-center gap-2 text-sm">
          <Checkbox checked={value.includes(o.id)} onCheckedChange={(c) => onChange(c === true ? [...value, o.id] : value.filter((x) => x !== o.id))} />
          <span className="line-clamp-1">{o.name}</span>
        </label>
      ))}
    </div>
  </fieldset>
);

function PostFields({ post, fields, setFields, body, setBody }: { post: BlogPost; fields: PostFieldsInput; setFields: (f: PostFieldsInput) => void; body: RichTextDoc; setBody: (b: RichTextDoc) => void }) {
  const { data: authors = [] } = useQuery(authorsQuery());
  const { data: cats = [] } = useQuery(categoriesQuery());
  const { data: tags = [] } = useQuery(tagsQuery());
  const { data: media = [] } = useQuery(mediaQuery());
  const { data: posts = [] } = useQuery(contentListQuery({ type: "post" }));
  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <Label htmlFor="excerpt">Excerpt</Label>
        <Textarea id="excerpt" rows={2} value={fields.excerpt} onChange={(e) => setFields({ ...fields, excerpt: e.target.value })} aria-invalid={!fields.excerpt.trim()} />
        {!fields.excerpt.trim() && <p className="text-sm text-destructive">Excerpt is required</p>}
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1"><Label htmlFor="author">Author</Label><select id="author" className="h-9 w-full rounded-md border bg-card px-2 text-sm" value={fields.authorId} onChange={(e) => setFields({ ...fields, authorId: e.target.value })}>{authors.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></div>
        <div className="space-y-1"><Label htmlFor="locale">Locale</Label><select id="locale" className="h-9 w-full rounded-md border bg-card px-2 text-sm" value={fields.locale} onChange={(e) => setFields({ ...fields, locale: e.target.value as PostFieldsInput["locale"] })}><option value="en">en</option><option value="es">es</option><option value="ja">ja</option></select></div>
        <div className="space-y-1"><Label htmlFor="hero">Hero image</Label><select id="hero" className="h-9 w-full rounded-md border bg-card px-2 text-sm" value={fields.heroId ?? ""} onChange={(e) => setFields({ ...fields, heroId: e.target.value || null })}><option value="">None</option>{media.map((m) => <option key={m.id} value={m.id}>{m.alt}</option>)}</select></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <MultiPick label="Categories" options={cats} value={fields.categoryIds} onChange={(v) => setFields({ ...fields, categoryIds: v })} />
        <MultiPick label="Tags" options={tags} value={fields.tagIds} onChange={(v) => setFields({ ...fields, tagIds: v })} />
        <MultiPick label="Related posts" options={posts.filter((p) => p.id !== post.id).map((p) => ({ id: p.id, name: p.title }))} value={fields.relatedPostIds} onChange={(v) => setFields({ ...fields, relatedPostIds: v })} />
      </div>
      <div>
        <p className="mb-2 text-sm font-medium">Body</p>
        <BlockEditor value={body} onChange={setBody} media={media} />
      </div>
    </div>
  );
}

function Editor({ item }: { item: ContentRecord }) {
  const navigate = useNavigate();
  const save = useSaveContentMutation(item.record.id);
  const del = useDeleteContentMutation();
  const r = item.record;
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CommonContentInput>({
    resolver: zodResolver(commonContentSchema),
    defaultValues: { title: titleOf(item), slug: r.slug, status: r.status, scheduledAt: r.scheduledAt, seoTitle: r.seoTitle ?? "", seoDescription: r.seoDescription ?? "" },
  });
  const post = item.type === "post" ? item.record : null;
  const [fields, setFields] = useState<PostFieldsInput | null>(post ? { excerpt: post.excerpt, authorId: post.authorId, categoryIds: post.categoryIds, tagIds: post.tagIds, heroId: post.heroId, relatedPostIds: post.relatedPostIds, locale: post.locale === "es" || post.locale === "ja" ? post.locale : "en" } : null);
  const [body, setBody] = useState<RichTextDoc>(post?.body ?? []);
  const [productF, setProductF] = useState<ProductFieldsInput | null>(null);
  const [eventF, setEventF] = useState<EventFieldsInput | null>(item.type === "event" ? eventDefaults(item.record) : null);
  const [resourceF, setResourceF] = useState<ResourceFieldsInput | null>(item.type === "resource" ? resourceDefaults(item.record) : null);
  const status = watch("status");
  const buildTyped = (): TypedFields | undefined | string => {
    if (fields) return { type: "post", fields, body };
    const check = <T,>(schema: { safeParse: (v: unknown) => { success: true; data: T } | { success: false; error: { issues: { message: string }[] } } }, v: unknown): T | string => {
      const res = schema.safeParse(v);
      return res.success ? res.data : (res.error.issues[0]?.message ?? "Invalid fields");
    };
    if (productF) { const v = check(productFieldsSchema, productF); return typeof v === "string" ? v : { type: "product", fields: v }; }
    if (eventF) { const v = check(eventFieldsSchema, eventF); return typeof v === "string" ? v : { type: "event", fields: v }; }
    if (resourceF) { const v = check(resourceFieldsSchema, resourceF); return typeof v === "string" ? v : { type: "resource", fields: v }; }
    return undefined;
  };

  const submit = (nextStatus?: CommonContentInput["status"]) => {
    if (nextStatus) setValue("status", nextStatus);
    return handleSubmit(async (common) => {
      if (fields && !fields.excerpt.trim()) return void toast.error("Excerpt is required");
      try {
        const typed = buildTyped();
        if (typeof typed === "string") return void toast.error(typed);
        await save.mutateAsync({ common, ...(typed ? { typed } : {}) });
        toast.success(common.status === "published" ? "Published" : common.status === "scheduled" ? "Scheduled" : common.status === "archived" ? "Archived" : "Draft saved");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Could not save");
      }
    })();
  };

  const onDelete = async (): Promise<void> => {
    try {
      const { removedReferences } = await del.mutateAsync(r.id);
      toast.success(`Deleted${removedReferences ? ` · ${removedReferences} reference(s) cleaned up` : ""}`);
      void navigate({ to: "/admin" });
    } catch { toast.error("Could not delete"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <nav aria-label="Breadcrumb" className="eyebrow"><Link to="/admin">Admin</Link> / {item.type}</nav>
          <h1 className="mt-1 text-3xl">{watch("title") || "Untitled"}</h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground"><Badge>{r.status}</Badge> saved state · <a href={publicPath(item)} className="text-primary">Public page</a> (visible only when published)</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Dialog>
            <DialogTrigger asChild><Button variant="outline">Preview</Button></DialogTrigger>
            <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
              <DialogHeader><DialogTitle className="font-display text-3xl">{watch("title")}</DialogTitle></DialogHeader>
              <p className="eyebrow">Preview of unsaved edits — not public</p>
              {fields && <p className="text-muted-foreground">{fields.excerpt}</p>}
              {post ? <RichText doc={body} /> : <p className="text-sm text-muted-foreground">Body preview is available for posts.</p>}
            </DialogContent>
          </Dialog>
          <AlertDialog>
            <AlertDialogTrigger asChild><Button variant="ghost" className="text-destructive">Delete</Button></AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader><AlertDialogTitle>Delete “{titleOf(item)}”?</AlertDialogTitle><AlertDialogDescription>This removes it everywhere and clears references from related content. Use Reset data to restore fixtures.</AlertDialogDescription></AlertDialogHeader>
              <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => void onDelete()} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction></AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); void submit(); }} noValidate className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="title" label={item.type === "product" ? "Name" : "Title"} error={errors.title?.message} {...register("title")} />
          <FormField id="slug" label="Slug" error={errors.slug?.message} {...register("slug")} />
          <FormField id="seoTitle" label="SEO title (optional, ≤70)" error={errors.seoTitle?.message} {...register("seoTitle")} />
          <FormField id="seoDescription" label="SEO description (optional, ≤160)" error={errors.seoDescription?.message} {...register("seoDescription")} />
        </div>
        {fields && post && <PostFields post={post} fields={fields} setFields={setFields} body={body} setBody={setBody} />}
        {item.type === "product" && <ProductFieldsEditor product={item.record} value={productF} onChange={setProductF} />}
        {eventF && <EventFieldsEditor value={eventF} onChange={setEventF} />}
        {resourceF && <ResourceFieldsEditor value={resourceF} onChange={setResourceF} />}
        <fieldset className="rounded-md border bg-paper p-4">
          <legend className="px-1 font-display text-lg">Publication</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="status">Status</Label>
              <select id="status" className="h-9 w-full rounded-md border bg-card px-2 text-sm" {...register("status")}>
                <option value="draft">Draft</option><option value="published">Published</option><option value="scheduled">Scheduled</option><option value="archived">Archived</option>
              </select>
            </div>
            {status === "scheduled" && (
              <div className="space-y-1">
                <Label htmlFor="scheduledAt">Publish at (your local time)</Label>
                <input id="scheduledAt" type="datetime-local" className="h-9 w-full rounded-md border bg-card px-2 text-sm" defaultValue={toLocalInput(r.scheduledAt)} onChange={(e) => setValue("scheduledAt", e.target.value ? new Date(e.target.value).toISOString() : null, { shouldValidate: true })} />
                {errors.scheduledAt && <p className="text-sm text-destructive">{errors.scheduledAt.message}</p>}
              </div>
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="submit" disabled={save.isPending}>{save.isPending ? "Saving…" : "Save"}</Button>
            <Button type="button" variant="outline" disabled={save.isPending} onClick={() => void submit("published")}>Publish now</Button>
            <Button type="button" variant="outline" disabled={save.isPending} onClick={() => void submit("draft")}>Revert to draft</Button>
            <Button type="button" variant="ghost" disabled={save.isPending} onClick={() => void submit("archived")}>Archive</Button>
          </div>
        </fieldset>
      </form>
    </div>
  );
}

function EditorRoute() {
  const { id } = Route.useParams();
  const q = useQuery({ ...contentQuery(id), enabled: id !== "new", retry: false });
  if (id === "new") return <NewContent />;
  if (q.isLoading) return <PageSkeleton />;
  if (q.error instanceof NotFoundError) return <NotFoundPanel what="Content" backTo="/admin" backLabel="Back to admin" />;
  if (q.error) return <p className="text-destructive">Could not load content: {q.error.message}</p>;
  if (!q.data) return null;
  return <Editor key={`${q.data.record.id}`} item={q.data} />;
}
