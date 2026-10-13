import heroImg from "@/assets/hero.jpg";
import productImg from "@/assets/product.jpg";
import eventImg from "@/assets/event.jpg";
import portraitImg from "@/assets/portrait.jpg";
import type {
  Author,
  BlogPost,
  Category,
  CustomerStory,
  Dataset,
  Event,
  FAQ,
  Job,
  MediaAsset,
  Page,
  Product,
  ProductReview,
  ProductVariant,
  PublicationStatus,
  Resource,
  RichText,
  Tag,
  TeamMember,
  Testimonial,
} from "./models";

/** Fixed clock for fixture construction and contract tests. */
export const FIXTURE_REFERENCE_TIME = "2026-10-01T00:00:00Z";

const T = (iso: string): string => new Date(iso).toISOString();
const stamp = { createdAt: T("2026-01-15T09:00:00Z"), updatedAt: T("2026-09-20T12:00:00Z") };
const seo = { seoTitle: null, seoDescription: null, seoImage: null };

const media: MediaAsset[] = [
  { id: "media-hero", path: heroImg, mimeType: "image/jpeg", alt: "Magazine proofs and colour swatches on a sunlit desk", caption: "Editorial proofs, studio archive", sizeBytes: 412_000, width: 1536, height: 896, focalPoint: { x: 0.4, y: 0.4 }, ...stamp },
  { id: "media-product", path: productImg, mimeType: "image/jpeg", alt: "Cream ceramic desk lamp beside a kraft notebook", caption: null, sizeBytes: 188_000, width: 1024, height: 1024, focalPoint: null, ...stamp },
  { id: "media-event", path: eventImg, mimeType: "image/jpeg", alt: "Speaker on stage in front of a full auditorium", caption: "DXS Summit 2025", sizeBytes: 301_000, width: 1280, height: 768, focalPoint: { x: 0.45, y: 0.4 }, ...stamp },
  { id: "media-portrait", path: portraitImg, mimeType: "image/jpeg", alt: "Portrait of a smiling person against a cream backdrop", caption: null, sizeBytes: 96_000, width: 816, height: 816, focalPoint: { x: 0.5, y: 0.35 }, ...stamp },
];

const authors: Author[] = [
  { id: "author-ines", slug: "ines-moreau", name: "Inès Moreau", bio: "Content architect who has moved eleven editorial teams between CMS platforms without losing a single footnote.", avatarId: "media-portrait", social: [{ label: "Website", url: "https://example.com/ines" }], ...stamp },
  { id: "author-kenji", slug: "kenji-watanabe", name: "渡辺 健二 (Kenji Watanabe)", bio: "Engineer focused on structured content, schema design and rich-text fidelity.", avatarId: "media-portrait", social: [], ...stamp },
  { id: "author-amara", slug: "amara-okafor", name: "Amara Okafor", bio: "Product lead for commerce content models and localisation workflows.", avatarId: "media-portrait", social: [{ label: "LinkedIn", url: "https://example.com/amara" }], ...stamp },
];

const categories: Category[] = [
  { id: "cat-migration", slug: "migration", name: "Migration", description: "Moving content between platforms with integrity checks.", parentId: null, ...stamp },
  { id: "cat-modeling", slug: "content-modeling", name: "Content modeling", description: "Schemas, references and field types.", parentId: "cat-migration", ...stamp },
  { id: "cat-commerce", slug: "commerce", name: "Commerce", description: "Products, variants and inventory.", parentId: null, ...stamp },
  { id: "cat-workspace", slug: "workspace", name: "Workspace", description: "Objects for the modern desk.", parentId: "cat-commerce", ...stamp },
];

const tags: Tag[] = [
  { id: "tag-rich-text", slug: "rich-text", name: "Rich text", description: "Structured body content.", ...stamp },
  { id: "tag-references", slug: "references", name: "References", description: null, ...stamp },
  { id: "tag-localization", slug: "localization", name: "Localization", description: "Multilingual fields.", ...stamp },
  { id: "tag-assets", slug: "assets", name: "Assets", description: null, ...stamp },
];

const body = (topic: string): RichText => [
  { type: "paragraph", children: [{ type: "text", text: `${topic} is where most migrations quietly lose fidelity. ` }, { type: "text", text: "Measure before you move.", marks: ["bold"] }] },
  { type: "heading", level: 2, text: "What to verify" },
  { type: "list", ordered: false, items: [[{ type: "text", text: "Record counts per content type" }], [{ type: "text", text: "Reference integrity across " }, { type: "text", text: "one-to-many", marks: ["italic"] }, { type: "text", text: " links" }], [{ type: "text", text: "Publication state and ordering" }]] },
  { type: "quote", text: "If you can't diff it, you didn't migrate it.", cite: "DXS field notes" },
  { type: "code", language: "ts", code: "expect(target.count('blogPost')).toBe(source.count('blogPost'));" },
  { type: "image", assetId: "media-hero" },
  { type: "embed", refType: "product", refId: "prod-lamp" },
  { type: "paragraph", children: [{ type: "text", text: "Read the " }, { type: "link", href: "/resources/migration-checklist", text: "migration checklist" }, { type: "text", text: " for the full procedure." }] },
];

const postSeeds: { slug: string; title: string; status: PublicationStatus; publishedAt: string | null; scheduledAt?: string; author: string; cats: string[]; tags: string[]; locale?: string }[] = [
  { slug: "verifying-rich-text-after-migration", title: "Verifying rich text after a migration", status: "published", publishedAt: "2026-09-28T10:00:00Z", author: "author-ines", cats: ["cat-migration"], tags: ["tag-rich-text"] },
  { slug: "reference-integrity-at-scale", title: "Reference integrity at scale", status: "published", publishedAt: "2026-09-21T10:00:00Z", author: "author-kenji", cats: ["cat-modeling"], tags: ["tag-references"] },
  { slug: "modeling-product-variants", title: "Modeling product variants without regret", status: "published", publishedAt: "2026-09-14T10:00:00Z", author: "author-amara", cats: ["cat-commerce"], tags: ["tag-references"] },
  { slug: "localized-fields-deep-dive", title: "Localized fields: a deep dive into locale fallbacks", status: "published", publishedAt: "2026-09-07T10:00:00Z", author: "author-kenji", cats: ["cat-modeling"], tags: ["tag-localization"] },
  { slug: "asset-metadata-checklist", title: "Asset metadata: alt text, focal points and dimensions", status: "published", publishedAt: "2026-08-31T10:00:00Z", author: "author-ines", cats: ["cat-migration"], tags: ["tag-assets"] },
  { slug: "contentful-to-sanity-notes", title: "Contentful → Sanity: field-by-field notes", status: "published", publishedAt: "2026-08-24T10:00:00Z", author: "author-ines", cats: ["cat-migration"], tags: ["tag-rich-text", "tag-references"] },
  { slug: "wordpress-to-contentful-notes", title: "WordPress → Contentful: taming shortcodes", status: "published", publishedAt: "2026-08-17T10:00:00Z", author: "author-amara", cats: ["cat-migration"], tags: ["tag-rich-text"] },
  { slug: "dato-to-hygraph-notes", title: "Dato → Hygraph: blocks, modular content and you", status: "published", publishedAt: "2026-08-10T10:00:00Z", author: "author-kenji", cats: ["cat-migration"], tags: ["tag-references"] },
  { slug: "guia-de-migracion", title: "Guía de migración: contenido multilingüe sin pérdidas", status: "published", publishedAt: "2026-08-03T10:00:00Z", author: "author-amara", cats: ["cat-modeling"], tags: ["tag-localization"], locale: "es" },
  { slug: "an-exceptionally-long-title-to-test-wrapping-truncation-and-seo-field-limits-across-every-target-platform", title: "An exceptionally long title to test wrapping, truncation and SEO field limits across every target platform we migrate to", status: "published", publishedAt: "2026-07-27T10:00:00Z", author: "author-ines", cats: ["cat-migration"], tags: [] },
  { slug: "draft-ordering-semantics", title: "Draft: ordering semantics for nested blocks", status: "draft", publishedAt: null, author: "author-kenji", cats: ["cat-modeling"], tags: [] },
  { slug: "scheduled-october-roundup", title: "October roundup (scheduled)", status: "scheduled", publishedAt: null, scheduledAt: "2026-10-05T09:00:00Z", author: "author-amara", cats: ["cat-migration"], tags: [] },
  { slug: "scheduled-2027-preview", title: "2027 roadmap preview (scheduled)", status: "scheduled", publishedAt: null, scheduledAt: "2027-01-15T09:00:00Z", author: "author-ines", cats: ["cat-migration"], tags: [] },
  { slug: "archived-legacy-importer", title: "Archived: the legacy XML importer", status: "archived", publishedAt: "2025-11-01T10:00:00Z", author: "author-kenji", cats: ["cat-migration"], tags: [] },
];

const posts: BlogPost[] = postSeeds.map((p, i) => ({
  id: `post-${String(i + 1).padStart(2, "0")}`,
  slug: p.slug,
  status: p.status,
  publishedAt: p.publishedAt ? T(p.publishedAt) : null,
  scheduledAt: p.scheduledAt ? T(p.scheduledAt) : null,
  ...seo,
  title: p.title,
  excerpt: `A practical look at ${p.title.toLowerCase()} — with fixtures you can diff.`,
  body: body(p.title),
  authorId: p.author,
  categoryIds: p.cats,
  tagIds: p.tags,
  heroId: i % 3 === 2 ? null : "media-hero",
  relatedPostIds: [`post-0${((i + 1) % 9) + 1}`, `post-0${((i + 2) % 9) + 1}`],
  locale: p.locale ?? "en",
  ...stamp,
}));

const productSeeds = [
  { id: "prod-lamp", slug: "ceramic-desk-lamp", name: "Ceramic desk lamp", options: ["Cream", "Terracotta"], price: 14_900, stocks: [12, 0] },
  { id: "prod-notebook", slug: "kraft-notebook", name: "Kraft notebook", options: ["A5", "A4"], price: 1_800, stocks: [80, 25] },
  { id: "prod-proofs", slug: "proofing-loupe", name: "Proofing loupe", options: ["Brass"], price: 4_200, stocks: [5] },
  { id: "prod-swatch", slug: "swatch-library", name: "Swatch library", options: ["Warm", "Cool"], price: 6_500, stocks: [0, 0] },
  { id: "prod-mug", slug: "speckled-mug", name: "Speckled mug", options: ["Small", "Large"], price: 2_400, stocks: [30, 18] },
  { id: "prod-tray", slug: "walnut-pen-tray", name: "Walnut pen tray", options: ["Natural"], price: 3_900, stocks: [9] },
];

const products: Product[] = productSeeds.map((p, i) => ({
  id: p.id,
  slug: p.slug,
  status: "published",
  publishedAt: T(`2026-0${(i % 8) + 1}-10T10:00:00Z`),
  scheduledAt: null,
  ...seo,
  name: p.name,
  description: [{ type: "paragraph", children: [{ type: "text", text: `${p.name}: made in small batches for the editorial desk.` }] }],
  galleryIds: ["media-product", "media-hero"],
  categoryIds: ["cat-commerce", "cat-workspace"],
  tagIds: [],
  relatedProductIds: productSeeds.filter((o) => o.id !== p.id).slice(0, 3).map((o) => o.id),
  availability: p.stocks.every((s) => s === 0) ? "preorder" : "available",
  ...stamp,
}));

const variants: ProductVariant[] = productSeeds.flatMap((p) =>
  p.options.map((opt, j) => ({
    id: `${p.id}-v${j + 1}`,
    productId: p.id,
    sku: `${p.slug.toUpperCase().slice(0, 6)}-${opt.toUpperCase().slice(0, 3)}`,
    options: { Option: opt },
    priceMinor: p.price + j * 500,
    currency: "USD" as const,
    stock: p.stocks[j] ?? 0,
    ...stamp,
  })),
);

const reviews: ProductReview[] = [
  { id: "rev-1", productId: "prod-lamp", reviewerName: "Sam R.", rating: 5, title: "Warm, even light", body: "Exactly what my desk needed.", moderation: "approved", ...stamp },
  { id: "rev-2", productId: "prod-lamp", reviewerName: "Priya K.", rating: 4, title: "Lovely glaze", body: "Cable could be longer.", moderation: "approved", ...stamp },
  { id: "rev-3", productId: "prod-notebook", reviewerName: "Jonas", rating: 5, title: "Lies flat", body: "Paper takes fountain pen ink well.", moderation: "approved", ...stamp },
  { id: "rev-4", productId: "prod-lamp", reviewerName: "Spam Bot", rating: 1, title: "Buy now", body: "Pending moderation fixture.", moderation: "pending", ...stamp },
];

const eventSeeds = [
  { id: "evt-summit", slug: "dxs-summit-2026", title: "DXS Summit 2026", start: "2026-11-18T15:00:00Z", hours: 8, venue: "Harbour Hall, Lisbon", online: null },
  { id: "evt-webinar", slug: "rich-text-fidelity-webinar", title: "Rich-text fidelity webinar", start: "2026-12-03T17:00:00Z", hours: 1, venue: null, online: "https://example.com/webinar" },
  { id: "evt-workshop", slug: "schema-design-workshop", title: "Schema design workshop", start: "2027-02-10T14:00:00Z", hours: 3, venue: "Studio 4, Berlin", online: null },
  { id: "evt-meetup", slug: "migration-meetup-september", title: "Migration meetup — September", start: "2026-09-10T18:00:00Z", hours: 2, venue: "Canal House, Amsterdam", online: null },
  { id: "evt-launch", slug: "testbed-launch-livestream", title: "Testbed launch livestream", start: "2026-06-02T16:00:00Z", hours: 1, venue: null, online: "https://example.com/live" },
];

const events: Event[] = eventSeeds.map((e) => ({
  id: e.id,
  slug: e.slug,
  status: "published",
  publishedAt: T("2026-05-01T10:00:00Z"),
  scheduledAt: null,
  ...seo,
  title: e.title,
  description: [{ type: "paragraph", children: [{ type: "text", text: `${e.title} brings migration practitioners together for hands-on sessions.` }] }],
  startAt: T(e.start),
  endAt: new Date(new Date(e.start).getTime() + e.hours * 3_600_000).toISOString(),
  timezone: "UTC",
  venue: e.venue,
  onlineUrl: e.online,
  speakerIds: ["author-ines", "author-kenji"],
  capacity: e.venue ? 200 : 1000,
  registrationOpen: true,
  heroId: "media-event",
  ...stamp,
}));

const resourceSeeds: { slug: string; title: string; type: Resource["type"] }[] = [
  { slug: "migration-checklist", title: "The migration checklist", type: "guide" },
  { slug: "content-model-whitepaper", title: "Portable content models (whitepaper)", type: "whitepaper" },
  { slug: "rich-text-walkthrough", title: "Rich-text walkthrough (video)", type: "video" },
  { slug: "fixture-pack", title: "Fixture pack (download)", type: "download" },
  { slug: "reference-mapping-guide", title: "Reference mapping guide", type: "guide" },
];

const resources: Resource[] = resourceSeeds.map((r, i) => ({
  id: `res-${i + 1}`,
  slug: r.slug,
  status: "published",
  publishedAt: T(`2026-0${i + 4}-01T10:00:00Z`),
  scheduledAt: null,
  ...seo,
  title: r.title,
  type: r.type,
  summary: `${r.title} for teams validating CMS migrations.`,
  body: body(r.title),
  mediaId: r.type === "video" ? "media-event" : "media-hero",
  filePath: r.type === "download" || r.type === "whitepaper" ? "/files/dxs-fixture-sample.txt" : null,
  categoryIds: ["cat-migration"],
  tagIds: ["tag-rich-text"],
  access: r.type === "whitepaper" ? "email-gated" : "public",
  ...stamp,
}));

const team: TeamMember[] = [
  { id: "team-1", name: "Inès Moreau", role: "Content architect", bio: "Leads fixture design.", portraitId: "media-portrait", social: [], order: 1, ...stamp },
  { id: "team-2", name: "Kenji Watanabe", role: "Platform engineer", bio: "Owns adapters and contracts.", portraitId: "media-portrait", social: [], order: 2, ...stamp },
  { id: "team-3", name: "Amara Okafor", role: "Product lead", bio: "Commerce and localisation.", portraitId: "media-portrait", social: [], order: 3, ...stamp },
];

const testimonials: Testimonial[] = [
  { id: "tm-1", quote: "We diffed 40,000 records in an afternoon and found the three that mattered.", attribution: "Lea Fischer, Head of Content", company: "Nordlicht Media", featured: true, ...stamp },
  { id: "tm-2", quote: "The fixtures caught a broken reference chain our vendor missed.", attribution: "Marcus Bell, Engineering Manager", company: "Pine & Co.", featured: true, ...stamp },
  { id: "tm-3", quote: "Finally a testbed that looks like a real site.", attribution: "Yuki Sato", company: "Ateliers Kumo", featured: false, ...stamp },
];

const stories: CustomerStory[] = [
  { id: "story-1", slug: "nordlicht-media", status: "published", publishedAt: T("2026-07-01T10:00:00Z"), scheduledAt: null, ...seo, title: "How Nordlicht Media moved 40k articles", company: "Nordlicht Media", body: body("Nordlicht's migration"), relatedProductIds: [], ...stamp },
];

const faqs: FAQ[] = [
  { id: "faq-1", question: "Does DXS need a network connection?", answer: [{ type: "paragraph", children: [{ type: "text", text: "No. Mock mode runs fully offline with local assets." }] }], categoryId: null, order: 1, ...stamp },
  { id: "faq-2", question: "Are my edits saved?", answer: [{ type: "paragraph", children: [{ type: "text", text: "Yes, in this browser. Use Reset data to restore the baseline." }] }], categoryId: null, order: 2, ...stamp },
  { id: "faq-3", question: "Is checkout real?", answer: [{ type: "paragraph", children: [{ type: "text", text: "No payment is collected; orders are simulated." }] }], categoryId: "cat-commerce", order: 3, ...stamp },
];

const jobs: Job[] = [
  { id: "job-1", slug: "senior-content-engineer", title: "Senior content engineer", department: "Platform", location: "Remote (EU)", description: "Design adapters and contract tests across CMS platforms.", open: true, ...stamp },
  { id: "job-2", slug: "editorial-designer", title: "Editorial designer", department: "Design", location: "Lisbon", description: "Shape how structured content renders across templates.", open: true, ...stamp },
  { id: "job-3", slug: "qa-analyst-migrations", title: "QA analyst, migrations", department: "Quality", location: "Remote", description: "Own verification runs and fixture diffs.", open: true, ...stamp },
];

const pages: Page[] = [
  {
    id: "page-home",
    slug: "home",
    status: "published",
    publishedAt: T("2026-01-20T10:00:00Z"),
    scheduledAt: null,
    ...seo,
    title: "Home",
    summary: "DXS homepage",
    template: "home",
    locale: "en",
    blocks: [
      { id: "blk-hero", type: "hero", heading: "A real-looking site, built to be migrated.", subheading: "DXS is a content testbed with deterministic fixtures, rich text, references and commerce — so you can prove a CMS migration worked.", mediaId: "media-hero", ctaLabel: "Read the field notes", ctaHref: "/blog" },
      { id: "blk-stats", type: "stats", items: [{ label: "Content models", value: "22" }, { label: "Route patterns", value: "23" }, { label: "Network calls in mock mode", value: "0" }] },
      { id: "blk-posts", type: "referenceList", heading: "Latest field notes", refType: "post", refIds: ["post-01", "post-02", "post-03"] },
      { id: "blk-products", type: "referenceList", heading: "From the shop", refType: "product", refIds: ["prod-lamp", "prod-notebook", "prod-mug"] },
      { id: "blk-events", type: "referenceList", heading: "Upcoming events", refType: "event", refIds: ["evt-summit", "evt-webinar", "evt-workshop"] },
      { id: "blk-tm", type: "testimonials", heading: "From migration teams", testimonialIds: ["tm-1", "tm-2"] },
      { id: "blk-news", type: "newsletter", heading: "Field notes, monthly." },
    ],
    ...stamp,
  },
];

export const createSeed = (): Dataset =>
  structuredClone({
    media,
    authors,
    categories,
    tags,
    posts,
    products,
    variants,
    reviews,
    events,
    resources,
    team,
    testimonials,
    stories,
    faqs,
    jobs,
    pages,
    contactSubmissions: [],
    newsletter: [],
    registrations: [],
    applications: [],
    orders: [],
  });
