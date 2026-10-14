import type {
  BlogPost,
  ContentSummary,
  ContentType,
  Dataset,
  Event,
  Feedback,
  MediaAsset,
  Notification,
  Order,
  Product,
  ProductReview,
  Profile,
  Resource,
  RichText,
  Settings,
  SupportTicket,
  SurveyResponse,
} from "./models";
import { NotFoundError } from "./repository";
import {
  commonContentSchema,
  feedbackSchema,
  IMAGE_TYPES,
  MAX_UPLOAD_BYTES,
  mediaMetaSchema,
  postFieldsSchema,
  profileSchema,
  reviewSchema,
  settingsSchema,
  surveySchema,
  ticketSchema,
  type CommonContentInput,
  type FeedbackInput,
  type MediaMetaInput,
  type TypedFields,
  eventFieldsSchema,
  productFieldsSchema,
  resourceFieldsSchema,
  type ProfileInput,
  type ReviewInput,
  type SettingsInput,
  type SurveyInput,
  type TicketInput,
} from "./schemas";

export type ContentRecord =
  | { type: "post"; record: BlogPost }
  | { type: "product"; record: Product }
  | { type: "event"; record: Event }
  | { type: "resource"; record: Resource };

export interface UploadInput {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  dataUrl: string;
  width: number | null;
  height: number | null;
  alt: string;
}

export interface PrivateSnapshot {
  orders: Order[];
  registrations: Dataset["registrations"];
  contactSubmissions: Dataset["contactSubmissions"];
  newsletter: Dataset["newsletter"];
  applications: Dataset["applications"];
  notifications: Notification[];
  tickets: SupportTicket[];
  surveys: SurveyResponse[];
  feedback: Feedback[];
  content: ContentSummary[];
}

export type DeleteMediaResult = { ok: true } | { ok: false; referencedBy: string[] };

/** Operations for the demo identity's private views and the CMS. Mock mode has one demo admin. */
export interface PrivateRepository {
  getProfile(): Promise<Profile>;
  updateProfile(input: ProfileInput): Promise<Profile>;
  getSettings(): Promise<Settings>;
  updateSettings(input: SettingsInput): Promise<Settings>;
  getPrivateSnapshot(): Promise<PrivateSnapshot>;
  markNotificationRead(id: string): Promise<void>;
  markAllNotificationsRead(): Promise<void>;
  createTicket(input: TicketInput): Promise<{ id: string }>;
  submitSurvey(input: SurveyInput): Promise<{ id: string }>;
  submitFeedback(input: FeedbackInput): Promise<{ id: string }>;
  submitReview(productId: string, input: ReviewInput): Promise<{ id: string }>;
  listContent(filter: { type?: ContentType | undefined; status?: ContentSummary["status"] | undefined; search?: string | undefined }): Promise<ContentSummary[]>;
  getContent(id: string): Promise<ContentRecord>;
  createContent(type: ContentType): Promise<{ id: string }>;
  saveContent(id: string, common: CommonContentInput, typed?: TypedFields): Promise<ContentRecord>;
  listReviews(moderation?: ProductReview["moderation"]): Promise<(ProductReview & { productName: string })[]>;
  moderateReview(id: string, moderation: ProductReview["moderation"]): Promise<void>;
  deleteContent(id: string): Promise<{ removedReferences: number }>;
  uploadMedia(input: UploadInput): Promise<MediaAsset>;
  updateMedia(id: string, input: MediaMetaInput): Promise<MediaAsset>;
  deleteMedia(id: string, force: boolean): Promise<DeleteMediaResult>;
}

interface Ctx {
  read: () => Dataset;
  save: (d: Dataset) => void;
  clock: () => Date;
  stamp: () => { id: string; createdAt: string; updatedAt: string };
}

const collectionOf = (type: ContentType): "posts" | "products" | "events" | "resources" =>
  ({ post: "posts", product: "products", event: "events", resource: "resources" } as const)[type];

export const summarize = (d: Dataset): ContentSummary[] => [
  ...d.posts.map((r): ContentSummary => ({ id: r.id, type: "post", title: r.title, slug: r.slug, status: r.status, publishedAt: r.publishedAt, scheduledAt: r.scheduledAt, updatedAt: r.updatedAt })),
  ...d.products.map((r): ContentSummary => ({ id: r.id, type: "product", title: r.name, slug: r.slug, status: r.status, publishedAt: r.publishedAt, scheduledAt: r.scheduledAt, updatedAt: r.updatedAt })),
  ...d.events.map((r): ContentSummary => ({ id: r.id, type: "event", title: r.title, slug: r.slug, status: r.status, publishedAt: r.publishedAt, scheduledAt: r.scheduledAt, updatedAt: r.updatedAt })),
  ...d.resources.map((r): ContentSummary => ({ id: r.id, type: "resource", title: r.title, slug: r.slug, status: r.status, publishedAt: r.publishedAt, scheduledAt: r.scheduledAt, updatedAt: r.updatedAt })),
];

const findContent = (d: Dataset, id: string): ContentRecord | null => {
  const post = d.posts.find((x) => x.id === id);
  if (post) return { type: "post", record: post };
  const product = d.products.find((x) => x.id === id);
  if (product) return { type: "product", record: product };
  const event = d.events.find((x) => x.id === id);
  if (event) return { type: "event", record: event };
  const resource = d.resources.find((x) => x.id === id);
  if (resource) return { type: "resource", record: resource };
  return null;
};

/** Where a media asset is referenced, as human-readable labels. */
export const mediaReferences = (d: Dataset, assetId: string): string[] => [
  ...d.posts.filter((p) => p.heroId === assetId || p.seoImage === assetId || p.body.some((n) => n.type === "image" && n.assetId === assetId)).map((p) => `Post: ${p.title}`),
  ...d.products.filter((p) => p.galleryIds.includes(assetId)).map((p) => `Product: ${p.name}`),
  ...d.events.filter((e) => e.heroId === assetId).map((e) => `Event: ${e.title}`),
  ...d.resources.filter((r) => r.mediaId === assetId).map((r) => `Resource: ${r.title}`),
  ...d.authors.filter((a) => a.avatarId === assetId).map((a) => `Author: ${a.name}`),
  ...d.team.filter((t) => t.portraitId === assetId).map((t) => `Team: ${t.name}`),
  ...d.pages.filter((p) => p.blocks.some((b) => b.type === "hero" && b.mediaId === assetId)).map((p) => `Page: ${p.title}`),
];

export const createPrivateOps = ({ read, save, clock, stamp }: Ctx): PrivateRepository => {
  const nowIso = (): string => clock().toISOString();

  const applyPublication = <T extends { status: string; publishedAt: string | null; scheduledAt: string | null }>(rec: T, c: CommonContentInput): T => {
    const status = c.status;
    if (status === "scheduled") return { ...rec, status, scheduledAt: new Date(c.scheduledAt ?? "").toISOString(), publishedAt: null };
    if (status === "published") return { ...rec, status, scheduledAt: null, publishedAt: rec.publishedAt ?? nowIso() };
    return { ...rec, status, scheduledAt: null };
  };

  return {
    async getProfile() {
      return read().private.profile;
    },
    async updateProfile(input) {
      const v = profileSchema.parse(input);
      const d = read();
      const profile: Profile = { ...d.private.profile, ...v, website: v.website || null, updatedAt: nowIso() };
      save({ ...d, private: { ...d.private, profile } });
      return profile;
    },
    async getSettings() {
      return read().private.settings;
    },
    async updateSettings(input) {
      const v = settingsSchema.parse(input);
      const d = read();
      const settings: Settings = { ...d.private.settings, ...v, updatedAt: nowIso() };
      save({ ...d, private: { ...d.private, settings } });
      return settings;
    },
    async getPrivateSnapshot() {
      const d = read();
      return {
        orders: d.orders,
        registrations: d.registrations,
        contactSubmissions: d.contactSubmissions,
        newsletter: d.newsletter,
        applications: d.applications,
        notifications: [...d.private.notifications].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
        tickets: [...d.private.tickets].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
        surveys: d.private.surveys,
        feedback: d.private.feedback,
        content: summarize(d),
      };
    },
    async markNotificationRead(id) {
      const d = read();
      save({ ...d, private: { ...d.private, notifications: d.private.notifications.map((n) => (n.id === id && !n.readAt ? { ...n, readAt: nowIso() } : n)) } });
    },
    async markAllNotificationsRead() {
      const d = read();
      save({ ...d, private: { ...d.private, notifications: d.private.notifications.map((n) => (n.readAt ? n : { ...n, readAt: nowIso() })) } });
    },
    async createTicket(input) {
      const v = ticketSchema.parse(input);
      const d = read();
      const s = stamp();
      const t: SupportTicket = { ...s, subject: v.subject, category: v.category, priority: v.priority, state: "open", messages: [{ at: s.createdAt, from: "customer", body: v.message }] };
      save({ ...d, private: { ...d.private, tickets: [...d.private.tickets, t] } });
      return { id: t.id };
    },
    async submitSurvey(input) {
      const v = surveySchema.parse(input);
      const d = read();
      const rec: SurveyResponse = { ...stamp(), ...v, satisfaction: v.satisfaction as SurveyResponse["satisfaction"] };
      save({ ...d, private: { ...d.private, surveys: [...d.private.surveys, rec] } });
      return { id: rec.id };
    },
    async submitFeedback(input) {
      const v = feedbackSchema.parse(input);
      const d = read();
      const rec: Feedback = { ...stamp(), ...v };
      save({ ...d, private: { ...d.private, feedback: [...d.private.feedback, rec] } });
      return { id: rec.id };
    },
    async submitReview(productId, input) {
      const v = reviewSchema.parse(input);
      const d = read();
      if (!d.products.some((p) => p.id === productId)) throw new NotFoundError("Product");
      const rec: ProductReview = { ...stamp(), productId, ...v, rating: v.rating as ProductReview["rating"], moderation: "pending" };
      save({ ...d, reviews: [...d.reviews, rec] });
      return { id: rec.id };
    },
    async listContent({ type, status, search }) {
      const s = search?.trim().toLowerCase();
      return summarize(read())
        .filter((c) => !type || c.type === type)
        .filter((c) => !status || c.status === status)
        .filter((c) => !s || c.title.toLowerCase().includes(s) || c.slug.includes(s))
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },
    async getContent(id) {
      const found = findContent(read(), id);
      if (!found) throw new NotFoundError("Content");
      return found;
    },
    async createContent(type) {
      const d = read();
      const s = stamp();
      const base = { ...s, slug: `untitled-${s.id.toLowerCase()}`, status: "draft" as const, publishedAt: null, scheduledAt: null, seoTitle: null, seoDescription: null, seoImage: null };
      const empty: RichText = [{ type: "paragraph", children: [{ type: "text", text: "" }] }];
      if (type === "post") {
        const rec: BlogPost = { ...base, title: "Untitled post", excerpt: "", body: empty, authorId: d.authors[0]?.id ?? "", categoryIds: [], tagIds: [], heroId: null, relatedPostIds: [], locale: "en" };
        save({ ...d, posts: [...d.posts, rec] });
      } else if (type === "product") {
        const rec: Product = { ...base, name: "Untitled product", description: empty, galleryIds: [], categoryIds: [], tagIds: [], relatedProductIds: [], availability: "preorder" };
        save({ ...d, products: [...d.products, rec] });
      } else if (type === "event") {
        const start = new Date(clock().getTime() + 30 * 86_400_000).toISOString();
        const rec: Event = { ...base, title: "Untitled event", description: empty, startAt: start, endAt: new Date(new Date(start).getTime() + 3_600_000).toISOString(), timezone: "UTC", venue: null, onlineUrl: null, speakerIds: [], capacity: 50, registrationOpen: false, heroId: null };
        save({ ...d, events: [...d.events, rec] });
      } else {
        const rec: Resource = { ...base, title: "Untitled resource", type: "guide", summary: "", body: empty, mediaId: null, filePath: null, categoryIds: [], tagIds: [], access: "public" };
        save({ ...d, resources: [...d.resources, rec] });
      }
      return { id: s.id };
    },
    async saveContent(id, common, typed) {
      const c = commonContentSchema.parse(common);
      const d = read();
      const found = findContent(d, id);
      if (!found) throw new NotFoundError("Content");
      const key = collectionOf(found.type);
      const clash = (d[key] as { id: string; slug: string }[]).some((x) => x.slug === c.slug && x.id !== id);
      if (clash) throw new Error(`Another ${found.type} already uses the slug "${c.slug}"`);
      const seo = { seoTitle: c.seoTitle || null, seoDescription: c.seoDescription || null, updatedAt: nowIso(), slug: c.slug };
      let next: Dataset;
      if (found.type === "post") {
        const t = typed?.type === "post" ? typed : null;
        const fields = t ? postFieldsSchema.parse(t.fields) : null;
        const rec = applyPublication({ ...found.record, ...seo, title: c.title, ...(fields ?? {}), ...(t ? { body: t.body } : {}) }, c);
        next = { ...d, posts: d.posts.map((x) => (x.id === id ? rec : x)) };
      } else if (found.type === "product") {
        const pf = typed?.type === "product" ? productFieldsSchema.parse(typed.fields) : null;
        const rec = applyPublication({ ...found.record, ...seo, name: c.title, ...(pf ? { availability: pf.availability } : {}) }, c);
        const variants = pf
          ? d.variants.map((v) => {
              const u = pf.variants.find((x) => x.id === v.id && v.productId === id);
              return u ? { ...v, priceMinor: u.priceMinor, stock: u.stock, updatedAt: nowIso() } : v;
            })
          : d.variants;
        next = { ...d, variants, products: d.products.map((x) => (x.id === id ? rec : x)) };
      } else if (found.type === "event") {
        const ef = typed?.type === "event" ? eventFieldsSchema.parse(typed.fields) : null;
        const extra = ef ? { startAt: new Date(ef.startAt).toISOString(), endAt: new Date(ef.endAt).toISOString(), venue: ef.venue || null, onlineUrl: ef.onlineUrl || null, capacity: ef.capacity, registrationOpen: ef.registrationOpen } : {};
        const rec = applyPublication({ ...found.record, ...seo, title: c.title, ...extra }, c);
        next = { ...d, events: d.events.map((x) => (x.id === id ? rec : x)) };
      } else {
        const rf = typed?.type === "resource" ? resourceFieldsSchema.parse(typed.fields) : null;
        const rec = applyPublication({ ...found.record, ...seo, title: c.title, ...(rf ?? {}) }, c);
        next = { ...d, resources: d.resources.map((x) => (x.id === id ? rec : x)) };
      }
      save(next);
      const saved = findContent(next, id);
      if (!saved) throw new NotFoundError("Content");
      return saved;
    },
    async listReviews(moderation) {
      const d = read();
      return d.reviews
        .filter((r) => !moderation || r.moderation === moderation)
        .map((r) => ({ ...r, productName: d.products.find((p) => p.id === r.productId)?.name ?? "Deleted product" }))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
    async moderateReview(id, moderation) {
      const d = read();
      if (!d.reviews.some((r) => r.id === id)) throw new NotFoundError("Review");
      save({ ...d, reviews: d.reviews.map((r) => (r.id === id ? { ...r, moderation, updatedAt: nowIso() } : r)) });
    },
    async deleteContent(id) {
      const d = read();
      const found = findContent(d, id);
      if (!found) throw new NotFoundError("Content");
      let removed = 0;
      const strip = (ids: string[]): string[] => {
        const out = ids.filter((x) => x !== id);
        removed += ids.length - out.length;
        return out;
      };
      const next: Dataset = {
        ...d,
        posts: d.posts.filter((p) => p.id !== id).map((p) => ({ ...p, relatedPostIds: strip(p.relatedPostIds), body: p.body.filter((n) => !(n.type === "embed" && n.refId === id && ++removed)) })),
        products: d.products.filter((p) => p.id !== id).map((p) => ({ ...p, relatedProductIds: strip(p.relatedProductIds) })),
        variants: d.variants.filter((v) => v.productId !== id),
        reviews: d.reviews.filter((r) => r.productId !== id),
        events: d.events.filter((e) => e.id !== id),
        resources: d.resources.filter((r) => r.id !== id),
        stories: d.stories.map((s) => ({ ...s, relatedProductIds: strip(s.relatedProductIds) })),
        pages: d.pages.map((p) => ({ ...p, blocks: p.blocks.map((b) => (b.type === "referenceList" ? { ...b, refIds: strip(b.refIds) } : b)) })),
      };
      save(next);
      return { removedReferences: removed };
    },
    async uploadMedia(input) {
      if (!IMAGE_TYPES.includes(input.mimeType)) throw new Error("Only JPEG, PNG, WebP or GIF images are allowed");
      if (input.sizeBytes > MAX_UPLOAD_BYTES) throw new Error("Images must be 2 MB or smaller");
      const meta = mediaMetaSchema.parse({ alt: input.alt, caption: "" });
      const d = read();
      const asset: MediaAsset = { ...stamp(), path: input.dataUrl, mimeType: input.mimeType, alt: meta.alt, caption: null, sizeBytes: input.sizeBytes, width: input.width, height: input.height, focalPoint: null };
      save({ ...d, media: [...d.media, asset] });
      return asset;
    },
    async updateMedia(id, input) {
      const v = mediaMetaSchema.parse(input);
      const d = read();
      const a = d.media.find((m) => m.id === id);
      if (!a) throw new NotFoundError("Media");
      const next: MediaAsset = { ...a, alt: v.alt, caption: v.caption || null, updatedAt: nowIso() };
      save({ ...d, media: d.media.map((m) => (m.id === id ? next : m)) });
      return next;
    },
    async deleteMedia(id, force) {
      const d = read();
      if (!d.media.some((m) => m.id === id)) throw new NotFoundError("Media");
      const refs = mediaReferences(d, id);
      if (refs.length > 0 && !force) return { ok: false, referencedBy: refs };
      const next: Dataset = {
        ...d,
        media: d.media.filter((m) => m.id !== id),
        posts: d.posts.map((p) => ({ ...p, heroId: p.heroId === id ? null : p.heroId, seoImage: p.seoImage === id ? null : p.seoImage, body: p.body.filter((n) => !(n.type === "image" && n.assetId === id)) })),
        products: d.products.map((p) => ({ ...p, galleryIds: p.galleryIds.filter((g) => g !== id) })),
        events: d.events.map((e) => ({ ...e, heroId: e.heroId === id ? null : e.heroId })),
        resources: d.resources.map((r) => ({ ...r, mediaId: r.mediaId === id ? null : r.mediaId })),
        pages: d.pages.map((p) => ({ ...p, blocks: p.blocks.map((b) => (b.type === "hero" && b.mediaId === id ? { ...b, mediaId: null } : b)) })),
      };
      save(next);
      return { ok: true };
    },
  };
};
