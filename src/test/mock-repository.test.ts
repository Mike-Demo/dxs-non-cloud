import { describe, expect, it } from "vitest";
import { createMockRepository, memoryStore } from "@/lib/data/mock";
import { FIXTURE_REFERENCE_TIME } from "@/lib/data/fixtures";
import { computeTotals } from "@/lib/data/pricing";

const contact = { name: "Test Buyer", email: "buyer@example.com", line1: "1 Test St", city: "Lisbon", postalCode: "1000", country: "Portugal" };
const repoAt = (iso: string) => createMockRepository({ store: memoryStore(), clock: () => new Date(iso) });

describe("publication filtering", () => {
  it("hides drafts, archived and not-yet-due scheduled posts", async () => {
    const repo = repoAt(FIXTURE_REFERENCE_TIME);
    const { items } = await repo.listPosts({ pageSize: 100 });
    const statuses = new Set(items.map((p) => p.status));
    expect([...statuses]).toEqual(["published"]);
    await expect(repo.getPost("draft-ordering-semantics")).rejects.toThrow("not found");
    await expect(repo.getPost("archived-legacy-importer")).rejects.toThrow("not found");
    await expect(repo.getPost("scheduled-october-roundup")).rejects.toThrow("not found");
  });

  it("promotes a scheduled post once its scheduledAt is due, using scheduledAt as publishedAt", async () => {
    const repo = repoAt("2026-10-06T00:00:00Z");
    const post = await repo.getPost("scheduled-october-roundup");
    expect(post.status).toBe("published");
    expect(post.publishedAt).toBe("2026-10-05T09:00:00.000Z");
    await expect(repo.getPost("scheduled-2027-preview")).rejects.toThrow("not found");
  });

  it("paginates 10 published posts at 6 per page into 2 pages", async () => {
    const page2 = await repoAt(FIXTURE_REFERENCE_TIME).listPosts({ page: 2, pageSize: 6 });
    expect(page2.total).toBe(10);
    expect(page2.pageCount).toBe(2);
    expect(page2.items).toHaveLength(4);
  });
});

describe("checkout", () => {
  it("rejects a quantity above available stock", async () => {
    const r = await repoAt(FIXTURE_REFERENCE_TIME).checkout([{ variantId: "prod-proofs-v1", quantity: 6 }], contact);
    expect(r).toEqual({ ok: false, reason: "insufficient_stock", variantId: "prod-proofs-v1" });
  });

  it("decrements stock and derives totals from current prices", async () => {
    const repo = repoAt(FIXTURE_REFERENCE_TIME);
    const r = await repo.checkout([{ variantId: "prod-proofs-v1", quantity: 5 }], contact);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.order.totalMinor).toBe(21_000 + 1_680);
    const again = await repo.checkout([{ variantId: "prod-proofs-v1", quantity: 1 }], contact);
    expect(again.ok).toBe(false);
  });

  it("charges $8 shipping under $100 and none at or above it", () => {
    expect(computeTotals([{ unitPriceMinor: 1_800, quantity: 1 }]).shippingMinor).toBe(800);
    expect(computeTotals([{ unitPriceMinor: 10_000, quantity: 1 }]).shippingMinor).toBe(0);
  });
});

describe("reset", () => {
  it("restores the fixture baseline after a mutation", async () => {
    const repo = repoAt(FIXTURE_REFERENCE_TIME);
    await repo.checkout([{ variantId: "prod-proofs-v1", quantity: 5 }], contact);
    await repo.reset();
    const [v] = await repo.listVariants(["prod-proofs-v1"]);
    expect(v?.stock).toBe(5);
  });
});
