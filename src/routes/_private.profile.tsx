import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/site/FormField";
import { profileQuery } from "@/lib/data/queries";
import { useProfileMutation } from "@/lib/data/mutations";
import { IMAGE_TYPES, MAX_AVATAR_BYTES, profileSchema, type ProfileInput } from "@/lib/data/schemas";
import { readFileAsDataUrl } from "@/lib/files";

export const Route = createFileRoute("/_private/profile")({
  head: () => ({
    meta: [
      { title: "Profile — DXS" },
      { name: "description", content: "Edit the demo account's name, email, bio and avatar." },
      { property: "og:title", content: "Profile — DXS" },
      { property: "og:description", content: "Edit your profile." },
      { name: "robots", content: "noindex" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(profileQuery()),
  component: ProfilePage,
});

function ProfilePage() {
  const { data: p } = useSuspenseQuery(profileQuery());
  const m = useProfileMutation();
  const { register, handleSubmit, setValue, setError, watch, formState: { errors, isDirty } } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    values: { name: p.name, email: p.email, bio: p.bio, website: p.website ?? "", avatarDataUrl: p.avatarDataUrl },
  });
  const avatar = watch("avatarDataUrl");

  const onAvatar = async (f: File | undefined): Promise<void> => {
    if (!f) return;
    if (!IMAGE_TYPES.includes(f.type)) return setError("avatarDataUrl", { message: "Use a JPEG, PNG, WebP or GIF image" });
    if (f.size > MAX_AVATAR_BYTES) return setError("avatarDataUrl", { message: "Avatar must be 1 MB or smaller" });
    setValue("avatarDataUrl", await readFileAsDataUrl(f), { shouldDirty: true });
  };

  const onSubmit = handleSubmit(async (v) => {
    try { await m.mutateAsync(v); toast.success("Profile saved"); } catch { toast.error("Could not save profile"); }
  });

  return (
    <div className="max-w-2xl">
      <p className="eyebrow">Workspace</p>
      <h1 className="text-4xl">Profile</h1>
      <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
        <div className="flex items-center gap-4">
          {avatar ? <img src={avatar} alt="Your avatar" className="size-20 rounded-full object-cover" /> : <div className="flex size-20 items-center justify-center rounded-full bg-muted"><UserRound className="size-8 text-muted-foreground" /></div>}
          <div className="space-y-1">
            <Label htmlFor="avatar">Avatar (max 1 MB)</Label>
            <input id="avatar" type="file" accept="image/*" onChange={(e) => void onAvatar(e.target.files?.[0])} className="block text-sm" />
            {avatar && <Button type="button" size="sm" variant="ghost" onClick={() => setValue("avatarDataUrl", null, { shouldDirty: true })}>Remove avatar</Button>}
            {errors.avatarDataUrl && <p className="text-sm text-destructive">{errors.avatarDataUrl.message}</p>}
          </div>
        </div>
        <FormField id="p-name" label="Name" error={errors.name?.message} {...register("name")} />
        <FormField id="p-email" label="Email" type="email" error={errors.email?.message} {...register("email")} />
        <FormField id="p-web" label="Website (optional)" error={errors.website?.message} {...register("website")} />
        <div className="space-y-1"><Label htmlFor="p-bio">Bio</Label><Textarea id="p-bio" rows={4} aria-invalid={!!errors.bio} {...register("bio")} />{errors.bio && <p className="text-sm text-destructive">{errors.bio.message}</p>}</div>
        <Button type="submit" disabled={m.isPending || !isDirty}>{m.isPending ? "Saving…" : "Save profile"}</Button>
      </form>
    </div>
  );
}
