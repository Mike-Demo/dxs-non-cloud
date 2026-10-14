import { describe, expect, it } from "vitest";
import { eventFieldsSchema, productFieldsSchema } from "@/lib/data/schemas";

describe("typed content field rules", () => {
  it("rejects negative stock", () => {
    expect(productFieldsSchema.safeParse({ availability: "available", variants: [{ id: "v", priceMinor: 100, stock: -1 }] }).success).toBe(false);
  });
  it("rejects an event ending before it starts", () => {
    expect(eventFieldsSchema.safeParse({ startAt: "2026-05-02T10:00:00Z", endAt: "2026-05-01T10:00:00Z", venue: "Hall", onlineUrl: "", capacity: 10, registrationOpen: true }).success).toBe(false);
  });
  it("requires a venue or online URL", () => {
    expect(eventFieldsSchema.safeParse({ startAt: "2026-05-01T10:00:00Z", endAt: "2026-05-01T12:00:00Z", venue: "", onlineUrl: "", capacity: 10, registrationOpen: true }).success).toBe(false);
  });
});
