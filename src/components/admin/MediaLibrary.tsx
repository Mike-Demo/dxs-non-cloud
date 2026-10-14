import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { MediaAsset } from "@/lib/data/models";
import { mediaQuery } from "@/lib/data/queries";
import { useDeleteMediaMutation, useUpdateMediaMutation, useUploadMediaMutation } from "@/lib/data/mutations";
import { IMAGE_TYPES, MAX_UPLOAD_BYTES } from "@/lib/data/schemas";
import { readFileAsDataUrl, readImageSize } from "@/lib/files";

const kb = (n: number): string => `${Math.round(n / 1024)} KB`;

const EditDialog = ({ asset, onClose }: { asset: MediaAsset; onClose: () => void }) => {
  const [alt, setAlt] = useState(asset.alt);
  const [caption, setCaption] = useState(asset.caption ?? "");
  const m = useUpdateMediaMutation();
  const save = async (): Promise<void> => {
    if (!alt.trim()) return void toast.error("Alt text is required");
    try { await m.mutateAsync({ id: asset.id, input: { alt, caption } }); toast.success("Media updated"); onClose(); } catch { toast.error("Could not update media"); }
  };
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Edit media</DialogTitle></DialogHeader>
        <img src={asset.path} alt={asset.alt} className="max-h-64 w-full rounded object-contain" />
        <p className="text-xs text-muted-foreground">{asset.mimeType} · {kb(asset.sizeBytes)} · {asset.width ?? "?"}×{asset.height ?? "?"}</p>
        <div className="space-y-1"><Label htmlFor="m-alt">Alt text</Label><Input id="m-alt" value={alt} onChange={(e) => setAlt(e.target.value)} /></div>
        <div className="space-y-1"><Label htmlFor="m-cap">Caption</Label><Input id="m-cap" value={caption} onChange={(e) => setCaption(e.target.value)} /></div>
        <Button onClick={() => void save()} disabled={m.isPending}>Save</Button>
      </DialogContent>
    </Dialog>
  );
};

export const MediaLibrary = () => {
  const { data: media = [] } = useQuery(mediaQuery());
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [editing, setEditing] = useState<MediaAsset | null>(null);
  const [blocked, setBlocked] = useState<{ asset: MediaAsset; refs: string[] } | null>(null);
  const upload = useUploadMediaMutation();
  const del = useDeleteMediaMutation();

  const onUpload = async (f: File | undefined): Promise<void> => {
    if (!f) return;
    if (!IMAGE_TYPES.includes(f.type)) return void toast.error("Only JPEG, PNG, WebP or GIF images");
    if (f.size > MAX_UPLOAD_BYTES) return void toast.error("Images must be 2 MB or smaller");
    try {
      const dataUrl = await readFileAsDataUrl(f);
      const size = await readImageSize(dataUrl);
      await upload.mutateAsync({ fileName: f.name, mimeType: f.type, sizeBytes: f.size, dataUrl, width: size.width || null, height: size.height || null, alt: f.name.replace(/\.[^.]+$/, "") });
      toast.success("Uploaded — remember to write proper alt text");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    }
  };

  const remove = async (asset: MediaAsset, force: boolean): Promise<void> => {
    try {
      const r = await del.mutateAsync({ id: asset.id, force });
      if (!r.ok) return setBlocked({ asset, refs: r.referencedBy });
      setBlocked(null);
      toast.success(force ? "Deleted and references cleared" : "Deleted");
    } catch { toast.error("Could not delete"); }
  };

  const shown = media.filter((m) => (!type || m.mimeType === type) && (!search || m.alt.toLowerCase().includes(search.toLowerCase())));
  const types = [...new Set(media.map((m) => m.mimeType))];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input aria-label="Search media" placeholder="Search alt text…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <select aria-label="Media type" className="h-9 rounded-md border bg-card px-3 text-sm" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All types</option>
          {types.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <Label htmlFor="upload" className="ml-auto inline-flex h-9 cursor-pointer items-center rounded-md bg-primary px-4 text-sm text-primary-foreground">{upload.isPending ? "Uploading…" : "Upload image"}</Label>
        <input id="upload" type="file" accept="image/*" className="sr-only" onChange={(e) => { void onUpload(e.target.files?.[0]); e.target.value = ""; }} />
      </div>
      {shown.length === 0 ? <p className="text-sm text-muted-foreground">No media matches.</p> : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {shown.map((m) => (
            <li key={m.id} className="rounded-md border bg-card p-2">
              <img src={m.path} alt={m.alt} loading="lazy" className="aspect-square w-full rounded object-cover" />
              <p className="mt-2 line-clamp-2 text-xs">{m.alt}</p>
              <p className="text-[11px] text-muted-foreground">{m.mimeType} · {kb(m.sizeBytes)}</p>
              <div className="mt-2 flex gap-1">
                <Button size="sm" variant="outline" onClick={() => setEditing(m)}>Edit</Button>
                <Button size="sm" variant="ghost" onClick={() => void remove(m, false)}>Delete</Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {editing && <EditDialog asset={editing} onClose={() => setEditing(null)} />}
      <AlertDialog open={blocked !== null} onOpenChange={(o) => !o && setBlocked(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>This image is in use</AlertDialogTitle>
            <AlertDialogDescription>Deleting it will remove it from:</AlertDialogDescription>
          </AlertDialogHeader>
          <ul className="list-disc pl-5 text-sm">{blocked?.refs.map((r) => <li key={r}>{r}</li>)}</ul>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep image</AlertDialogCancel>
            <AlertDialogAction onClick={() => blocked && void remove(blocked.asset, true)} className="bg-destructive text-destructive-foreground">Delete anyway</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
