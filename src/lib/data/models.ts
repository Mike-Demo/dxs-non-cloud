/** Platform-neutral content contracts for the DXS testbed. Dates are ISO 8601 strings; references are stable ids. */

export type PublicationStatus = "published" | "draft" | "scheduled" | "archived";

export interface BaseRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface Publishable extends BaseRecord {
  slug: string;
  status: PublicationStatus;
  publishedAt: string | null;
  scheduledAt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoImage: string | null;
}

export type Mark = "bold" | "italic" | "code";

export type RichNode =
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "paragraph"; children: InlineNode[] }
  | { type: "list"; ordered: boolean; items: InlineNode[][] }
  | { type: "quote"; text: string; cite: string | null }
  | { type: "code"; language: string; code: string }
  | { type: "image"; assetId: string }
  | { type: "embed"; refType: "product" | "post" | "event"; refId: string };

export type InlineNode =
  | { type: "text"; text: string; marks?: Mark[] }
  | { type: "link"; href: string; text: string };

export type RichText = RichNode[];

export interface MediaAsset extends BaseRecord {
  path: string;
  mimeType: string;
  alt: string;
  caption: string | null;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  focalPoint: { x: number; y: number } | null;
}

export interface SocialLink {
  label: string;
  url: string;
}

export interface Author extends BaseRecord {
  slug: string;
  name: string;
  bio: string;
  avatarId: string;
  social: SocialLink[];
}

export interface Category extends BaseRecord {
  slug: string;
  name: string;
  description: string;
  parentId: string | null;
}

export interface Tag extends BaseRecord {
  slug: string;
  name: string;
  description: string | null;
}

export interface BlogPost extends Publishable {
  title: string;
  excerpt: string;
  body: RichText;
  authorId: string;
  categoryIds: string[];
  tagIds: string[];
  heroId: string | null;
  relatedPostIds: string[];
  locale: string;
}

export interface ProductVariant extends BaseRecord {
  productId: string;
  sku: string;
  options: Record<string, string>;
  priceMinor: number;
  currency: "USD";
  stock: number;
}

export interface Product extends Publishable {
  name: string;
  description: RichText;
  galleryIds: string[];
  categoryIds: string[];
  tagIds: string[];
  relatedProductIds: string[];
  availability: "available" | "preorder" | "discontinued";
}

export interface ProductReview extends BaseRecord {
  productId: string;
  reviewerName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title: string;
  body: string;
  moderation: "approved" | "pending" | "rejected";
}

export interface Event extends Publishable {
  title: string;
  description: RichText;
  startAt: string;
  endAt: string;
  timezone: string;
  venue: string | null;
  onlineUrl: string | null;
  speakerIds: string[];
  capacity: number;
  registrationOpen: boolean;
  heroId: string | null;
}

export interface Resource extends Publishable {
  title: string;
  type: "guide" | "whitepaper" | "video" | "download";
  summary: string;
  body: RichText;
  mediaId: string | null;
  filePath: string | null;
  categoryIds: string[];
  tagIds: string[];
  access: "public" | "email-gated";
}

export interface TeamMember extends BaseRecord {
  name: string;
  role: string;
  bio: string;
  portraitId: string;
  social: SocialLink[];
  order: number;
}

export interface Testimonial extends BaseRecord {
  quote: string;
  attribution: string;
  company: string;
  featured: boolean;
}

export interface CustomerStory extends Publishable {
  title: string;
  company: string;
  body: RichText;
  relatedProductIds: string[];
}

export interface FAQ extends BaseRecord {
  question: string;
  answer: RichText;
  categoryId: string | null;
  order: number;
}

export interface Job extends BaseRecord {
  slug: string;
  title: string;
  department: string;
  location: string;
  description: string;
  open: boolean;
}

export type ContentBlock =
  | { id: string; type: "hero"; heading: string; subheading: string; mediaId: string | null; ctaLabel: string; ctaHref: string }
  | { id: string; type: "stats"; items: { label: string; value: string }[] }
  | { id: string; type: "featureGrid"; heading: string; items: { title: string; body: string }[] }
  | { id: string; type: "referenceList"; heading: string; refType: "post" | "product" | "event"; refIds: string[] }
  | { id: string; type: "testimonials"; heading: string; testimonialIds: string[] }
  | { id: string; type: "cta"; heading: string; body: string; ctaLabel: string; ctaHref: string }
  | { id: string; type: "newsletter"; heading: string };

export interface Page extends Publishable {
  title: string;
  summary: string;
  template: "home" | "standard";
  locale: string;
  blocks: ContentBlock[];
}

/* Submissions */

export interface ContactSubmission extends BaseRecord {
  name: string;
  email: string;
  topic: "sales" | "support" | "press" | "other";
  message: string;
}

export interface NewsletterSubscription extends BaseRecord {
  email: string;
  consent: true;
}

export interface EventRegistration extends BaseRecord {
  eventId: string;
  name: string;
  email: string;
  attendance: "in-person" | "online";
}

export interface JobApplication extends BaseRecord {
  jobId: string;
  name: string;
  email: string;
  portfolioUrl: string | null;
  coverLetter: string;
  resumeFileName: string;
  consent: true;
  state: "received";
}

export interface Address {
  line1: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  variantId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPriceMinor: number;
}

export interface Order extends BaseRecord {
  ownerEmail: string;
  name: string;
  items: OrderItem[];
  currency: "USD";
  subtotalMinor: number;
  taxMinor: number;
  shippingMinor: number;
  totalMinor: number;
  shippingAddress: Address;
  orderState: "placed";
  paymentState: "simulated_paid";
}

export interface Dataset {
  media: MediaAsset[];
  authors: Author[];
  categories: Category[];
  tags: Tag[];
  posts: BlogPost[];
  products: Product[];
  variants: ProductVariant[];
  reviews: ProductReview[];
  events: Event[];
  resources: Resource[];
  team: TeamMember[];
  testimonials: Testimonial[];
  stories: CustomerStory[];
  faqs: FAQ[];
  jobs: Job[];
  pages: Page[];
  contactSubmissions: ContactSubmission[];
  newsletter: NewsletterSubscription[];
  registrations: EventRegistration[];
  applications: JobApplication[];
  orders: Order[];
  private: PrivateData;
}

/* Demo identity, private records and admin views */

export interface Profile extends BaseRecord {
  name: string;
  email: string;
  bio: string;
  website: string | null;
  avatarDataUrl: string | null;
  role: "admin";
}

export interface Settings extends BaseRecord {
  theme: "light" | "dark" | "system";
  locale: "en" | "es" | "ja";
  emailNotifications: boolean;
  productUpdates: boolean;
  digestFrequency: "daily" | "weekly" | "never";
}

export interface Notification extends BaseRecord {
  title: string;
  body: string;
  type: "order" | "event" | "content" | "system";
  href: string | null;
  readAt: string | null;
}

export interface TicketMessage {
  at: string;
  from: "customer" | "agent";
  body: string;
}

export interface SupportTicket extends BaseRecord {
  subject: string;
  category: "billing" | "technical" | "content" | "other";
  priority: "low" | "normal" | "high";
  messages: TicketMessage[];
  state: "open" | "pending" | "resolved";
}

export interface SurveyResponse extends BaseRecord {
  satisfaction: 1 | 2 | 3 | 4 | 5;
  mostUsed: "blog" | "shop" | "events" | "resources";
  comments: string;
}

export interface Feedback extends BaseRecord {
  page: string;
  sentiment: "positive" | "neutral" | "negative";
  message: string;
}

export type ContentType = "post" | "product" | "event" | "resource";

export interface ContentSummary {
  id: string;
  type: ContentType;
  title: string;
  slug: string;
  status: PublicationStatus;
  publishedAt: string | null;
  scheduledAt: string | null;
  updatedAt: string;
}

export interface PrivateData {
  profile: Profile;
  settings: Settings;
  notifications: Notification[];
  tickets: SupportTicket[];
  surveys: SurveyResponse[];
  feedback: Feedback[];
}
