import { createSeed } from "./fixtures";
import type { BlogPost, Dataset, Order, Product, Publishable } from "./models";
import { isPubliclyVisible, isUpcoming, promoteIfDue } from "./publication";
import { NotFoundError, type Paginated, type ProductWithVariants, type Repository } from "./repository";
import { applicationSchema, cartLineSchema, checkoutSchema, contactSchema, newsletterSchema, registrationSchema } from "./schemas";
import { computeTotals } from "./pricing";
import { createPrivateOps } from "./private-ops";

export interface KeyValueStore {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
}

export const memoryStore = (): KeyValueStore => {
  const m = new Map<string, string>();
  return { get: (k) => m.get(k) ?? null, set: (k, v) => void m.set(k, v), remove: (k) => void m.delete(k) };
};

const STORAGE_KEY = "dxs:mock-dataset:v2";

interface MockOptions {
  store: KeyValueStore;
  clock: () => Date;
  idFactory?: () => string;
}

export const createMockRepository = ({ store, clock, idFactory }: MockOptions): Repository => {
  let counter = 0;
  const newId = idFactory ?? (() => `local-${Date.now().toString(36)}-${(counter++).toString(36)}`);

  const load = (): Dataset => {
    const raw = store.get(STORAGE_KEY);
    if (!raw) return createSeed();
    try {
      return JSON.parse(raw) as Dataset;
    } catch {
      return createSeed();
    }
  };
  const save = (d: Dataset): void => store.set(STORAGE_KEY, JSON.stringify(d));

  /** Promote due scheduled records before every read, then persist. */
  const read = (): Dataset => {
    const now = clock();
    const d = load();
    const promote = <T extends Publishable>(xs: T[]): T[] => xs.map((x) => promoteIfDue(x, now));
    const next: Dataset = { ...d, posts: promote(d.posts), products: promote(d.products), events: promote(d.events), resources: promote(d.resources), pages: promote(d.pages), stories: promote(d.stories) };
    return next;
  };
  const visible = <T extends Publishable>(xs: T[]): T[] => xs.filter((x) => isPubliclyVisible(x, clock()));
  const byDateDesc = (a: BlogPost, b: BlogPost): number => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "");
  const stamp = (): { id: string; createdAt: string; updatedAt: string } => {
    const now = clock().toISOString();
    return { id: newId(), createdAt: now, updatedAt: now };
  };

  const withVariants = (d: Dataset, p: Product): ProductWithVariants => {
    const vs = d.variants.filter((v) => v.productId === p.id);
    return { ...p, variants: vs, fromPriceMinor: Math.min(...vs.map((v) => v.priceMinor)), inStock: vs.some((v) => v.stock > 0) };
  };

  const repo: Repository = {
    ...createPrivateOps({ read, save, clock, stamp }),
    mode: "mock",
    async getPage(slug) {
      const page = visible(read().pages).find((p) => p.slug === slug);
      if (!page) throw new NotFoundError("Page");
      return page;
    },
    async listPosts({ search, category, tag, page = 1, pageSize = 6 }) {
      const d = read();
      const s = search?.trim().toLowerCase();
      const cat = category ? d.categories.find((c) => c.slug === category)?.id : undefined;
      const tg = tag ? d.tags.find((t) => t.slug === tag)?.id : undefined;
      const all = visible(d.posts)
        .filter((p) => !s || p.title.toLowerCase().includes(s) || p.excerpt.toLowerCase().includes(s))
        .filter((p) => !category || (cat !== undefined && p.categoryIds.includes(cat)))
        .filter((p) => !tag || (tg !== undefined && p.tagIds.includes(tg)))
        .sort(byDateDesc);
      const pageCount = Math.max(1, Math.ceil(all.length / pageSize));
      const current = Math.min(Math.max(1, page), pageCount);
      const result: Paginated<BlogPost> = { items: all.slice((current - 1) * pageSize, current * pageSize), total: all.length, page: current, pageSize, pageCount };
      return result;
    },
    async getPost(slug) {
      const post = visible(read().posts).find((p) => p.slug === slug);
      if (!post) throw new NotFoundError("Post");
      return post;
    },
    async listPostsByIds(ids) {
      const vs = visible(read().posts);
      return ids.map((id) => vs.find((p) => p.id === id)).filter((p): p is BlogPost => p !== undefined);
    },
    async getAuthor(slug) {
      const d = read();
      const author = d.authors.find((a) => a.slug === slug);
      if (!author) throw new NotFoundError("Author");
      return { author, posts: visible(d.posts).filter((p) => p.authorId === author.id).sort(byDateDesc) };
    },
    async listAuthors() {
      return read().authors;
    },
    async getCategory(slug) {
      const d = read();
      const category = d.categories.find((c) => c.slug === slug);
      if (!category) throw new NotFoundError("Category");
      return {
        category,
        posts: visible(d.posts).filter((p) => p.categoryIds.includes(category.id)).sort(byDateDesc),
        products: visible(d.products).filter((p) => p.categoryIds.includes(category.id)).map((p) => withVariants(d, p)),
        resources: visible(d.resources).filter((r) => r.categoryIds.includes(category.id)),
      };
    },
    async listCategories() {
      return read().categories;
    },
    async listTags() {
      return read().tags;
    },
    async listMedia() {
      return read().media;
    },
    async listProducts({ search, category, maxPriceMinor, sort = "newest" }) {
      const d = read();
      const s = search?.trim().toLowerCase();
      const cat = category ? d.categories.find((c) => c.slug === category)?.id : undefined;
      const list = visible(d.products)
        .map((p) => withVariants(d, p))
        .filter((p) => !s || p.name.toLowerCase().includes(s))
        .filter((p) => !category || (cat !== undefined && p.categoryIds.includes(cat)))
        .filter((p) => maxPriceMinor === undefined || p.fromPriceMinor <= maxPriceMinor);
      const sorters: Record<NonNullable<typeof sort>, (a: ProductWithVariants, b: ProductWithVariants) => number> = {
        newest: (a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""),
        "price-asc": (a, b) => a.fromPriceMinor - b.fromPriceMinor,
        "price-desc": (a, b) => b.fromPriceMinor - a.fromPriceMinor,
        name: (a, b) => a.name.localeCompare(b.name),
      };
      return list.sort(sorters[sort]);
    },
    async getProduct(slug) {
      const d = read();
      const p = visible(d.products).find((x) => x.slug === slug);
      if (!p) throw new NotFoundError("Product");
      return { product: withVariants(d, p), reviews: d.reviews.filter((r) => r.productId === p.id && r.moderation === "approved") };
    },
    async listProductsByIds(ids) {
      const d = read();
      const vs = visible(d.products);
      return ids.map((id) => vs.find((p) => p.id === id)).filter((p): p is Product => p !== undefined).map((p) => withVariants(d, p));
    },
    async listVariants(ids) {
      const d = read();
      return ids.flatMap((id) => {
        const v = d.variants.find((x) => x.id === id);
        const p = v ? d.products.find((x) => x.id === v.productId) : undefined;
        return v && p ? [{ ...v, productName: p.name, productSlug: p.slug }] : [];
      });
    },
    async listEvents(when) {
      const now = clock();
      return visible(read().events)
        .filter((e) => when === "all" || (when === "upcoming" ? isUpcoming(e.startAt, now) : !isUpcoming(e.startAt, now)))
        .sort((a, b) => (when === "past" ? b.startAt.localeCompare(a.startAt) : a.startAt.localeCompare(b.startAt)));
    },
    async getEvent(slug) {
      const e = visible(read().events).find((x) => x.slug === slug);
      if (!e) throw new NotFoundError("Event");
      return e;
    },
    async listResources(type) {
      return visible(read().resources).filter((r) => !type || r.type === type);
    },
    async getResource(slug) {
      const r = visible(read().resources).find((x) => x.slug === slug);
      if (!r) throw new NotFoundError("Resource");
      return r;
    },
    async listTeam() {
      return [...read().team].sort((a, b) => a.order - b.order);
    },
    async listTestimonials(ids) {
      const all = read().testimonials;
      return ids ? all.filter((t) => ids.includes(t.id)) : all;
    },
    async listStories() {
      return visible(read().stories);
    },
    async listFaqs() {
      return [...read().faqs].sort((a, b) => a.order - b.order);
    },
    async listJobs() {
      return read().jobs.filter((j) => j.open);
    },
    async submitContact(input) {
      const data = contactSchema.parse(input);
      const d = read();
      const rec = { ...stamp(), ...data };
      save({ ...d, contactSubmissions: [...d.contactSubmissions, rec] });
      return { id: rec.id };
    },
    async subscribeNewsletter(input) {
      const data = newsletterSchema.parse(input);
      const d = read();
      const existing = d.newsletter.find((n) => n.email.toLowerCase() === data.email.toLowerCase());
      if (existing) return { id: existing.id, alreadySubscribed: true };
      const rec = { ...stamp(), ...data };
      save({ ...d, newsletter: [...d.newsletter, rec] });
      return { id: rec.id, alreadySubscribed: false };
    },
    async registerForEvent(eventId, input) {
      const data = registrationSchema.parse(input);
      const d = read();
      const ev = visible(d.events).find((e) => e.id === eventId);
      if (!ev) throw new NotFoundError("Event");
      if (!ev.registrationOpen || !isUpcoming(ev.startAt, clock())) throw new Error("Registration is closed for this event");
      const taken = d.registrations.filter((r) => r.eventId === eventId).length;
      if (taken >= ev.capacity) throw new Error("This event is full");
      const rec = { ...stamp(), eventId, ...data };
      save({ ...d, registrations: [...d.registrations, rec] });
      return { id: rec.id };
    },
    async applyToJob(jobId, input) {
      const data = applicationSchema.parse(input);
      const d = read();
      if (!d.jobs.some((j) => j.id === jobId && j.open)) throw new NotFoundError("Job");
      const rec = { ...stamp(), jobId, ...data, portfolioUrl: data.portfolioUrl || null, state: "received" as const };
      save({ ...d, applications: [...d.applications, rec] });
      return { id: rec.id };
    },
    async checkout(lines, input) {
      const contact = checkoutSchema.parse(input);
      const parsed = lines.map((l) => cartLineSchema.parse(l));
      if (parsed.length === 0) return { ok: false, reason: "empty_cart" };
      const d = read();
      const variants = d.variants.map((v) => ({ ...v }));
      const items: Order["items"] = [];
      for (const line of parsed) {
        const v = variants.find((x) => x.id === line.variantId);
        if (!v) return { ok: false, reason: "unknown_variant", variantId: line.variantId };
        if (v.stock < line.quantity) return { ok: false, reason: "insufficient_stock", variantId: v.id };
        v.stock -= line.quantity;
        const product = d.products.find((p) => p.id === v.productId);
        items.push({ variantId: v.id, productName: product?.name ?? v.sku, sku: v.sku, quantity: line.quantity, unitPriceMinor: v.priceMinor });
      }
      const totals = computeTotals(items.map((i) => ({ unitPriceMinor: i.unitPriceMinor, quantity: i.quantity })));
      const order: Order = {
        ...stamp(),
        ownerEmail: contact.email,
        name: contact.name,
        items,
        currency: "USD",
        ...totals,
        shippingAddress: { line1: contact.line1, city: contact.city, postalCode: contact.postalCode, country: contact.country },
        orderState: "placed",
        paymentState: "simulated_paid",
      };
      save({ ...d, variants, orders: [...d.orders, order] });
      return { ok: true, order };
    },
    async reset() {
      store.remove(STORAGE_KEY);
    },
  };
  return repo;
};
