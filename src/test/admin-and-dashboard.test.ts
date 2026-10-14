import { describe, expect, it } from "vitest";
import { createMockRepository, memoryStore } from "@/lib/data/mock";
import { FIXTURE_REFERENCE_TIME } from "@/lib/data/fixtures";
import { buildDashboard } from "@/lib/dashboard";

const repoAt = (iso: string) => createMockRepository({ store: memoryStore(), clock: () => new Date(iso) });
const common = { title: "Hello", slug: "hello-world", status: "draft" as const, scheduledAt: null, seoTitle: "", seoDescription: "" };

describe("CMS editing", () => {
  it("rejects a slug already used by another post", async () => {
    const repo = repoAt(FIXTURE_REFERENCE_TIME);
    const { id } = await repo.createContent("post");
    await expect(repo.saveContent(id, { ...common, slug: "reference-integrity-at-scale" })).rejects.toThrow("already uses the slug");
  });

  it("requires a date when scheduling", async () => {
    const repo = repoAt(FIXTURE_REFERENCE_TIME);
    const { id } = await repo.createContent("post");
    await expect(repo.saveContent(id, { ...common, status: "scheduled", scheduledAt: null })).rejects.toThrow();
  });

  it("keeps a new draft out of public listings until published", async () => {
    const repo = repoAt(FIXTURE_REFERENCE_TIME);
    const { id } = await repo.createContent("post");
    await repo.saveContent(id, common);
    await expect(repo.getPost("hello-world")).rejects.toThrow("not found");
    await repo.saveContent(id, { ...common, status: "published" });
    expect((await repo.getPost("hello-world")).publishedAt).toBe("2026-10-01T00:00:00.000Z");
  });

  it("deleting a post removes it from other posts' related lists", async () => {
    const repo = repoAt(FIXTURE_REFERENCE_TIME);
    const before = await repo.getContent("post-01");
    expect(before.type === "post" && before.record.relatedPostIds).toContain("post-02");
    await repo.deleteContent("post-02");
    const after = await repo.getContent("post-01");
    expect(after.type === "post" && after.record.relatedPostIds).not.toContain("post-02");
  });
});

describe("media library", () => {
  it("blocks deleting a referenced image unless forced", async () => {
    const repo = repoAt(FIXTURE_REFERENCE_TIME);
    const r = await repo.deleteMedia("media-hero", false);
    expect(r.ok).toBe(false);
    expect(await repo.deleteMedia("media-hero", true)).toEqual({ ok: true });
    const post = await repo.getContent("post-01");
    expect(post.type === "post" && post.record.heroId).toBeNull();
  });

  it("rejects uploads over 2 MB", async () => {
    const repo = repoAt(FIXTURE_REFERENCE_TIME);
    await expect(repo.uploadMedia({ fileName: "a.png", mimeType: "image/png", sizeBytes: 3 * 1024 * 1024, dataUrl: "data:,", width: 1, height: 1, alt: "a" })).rejects.toThrow("2 MB");
  });
});

describe("dashboard", () => {
  it("sums only orders inside the selected range", async () => {
    const snap = await repoAt(FIXTURE_REFERENCE_TIME).getPrivateSnapshot();
    const all = buildDashboard(snap, "all", new Date(FIXTURE_REFERENCE_TIME));
    const last30 = buildDashboard(snap, "30d", new Date(FIXTURE_REFERENCE_TIME));
    expect(all.orderCount).toBe(9);
    expect(last30.orderCount).toBe(2);
  });

  it("new reviews start in pending moderation and stay hidden", async () => {
    const repo = repoAt(FIXTURE_REFERENCE_TIME);
    await repo.submitReview("prod-lamp", { reviewerName: "Ann", rating: 5, title: "Great", body: "Really nice lamp indeed." });
    const { reviews } = await repo.getProduct("ceramic-desk-lamp");
    expect(reviews.some((r) => r.reviewerName === "Ann")).toBe(false);
  });
});
