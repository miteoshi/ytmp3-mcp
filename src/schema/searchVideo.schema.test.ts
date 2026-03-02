import { describe, it, expect } from "vitest";
import { SearchVideosSchema } from "./searchVideo.js";

describe("SearchVideosSchema", () => {
  // ── query ──────────────────────────────────────────────────────────────────

  describe("query", () => {
    it("accepts a valid query", () => {
      const result = SearchVideosSchema.parse({ query: "baby keem" });
      expect(result.query).toBe("baby keem");
    });

    it("rejects an empty query", () => {
      expect(() => SearchVideosSchema.parse({ query: "" })).toThrow(
        "Query cannot be empty"
      );
    });

    it("rejects a query over 200 characters", () => {
      expect(() =>
        SearchVideosSchema.parse({ query: "a".repeat(201) })
      ).toThrow("Query must not exceed 200 characters");
    });

    it("accepts a query at exactly 200 characters", () => {
      expect(() =>
        SearchVideosSchema.parse({ query: "a".repeat(200) })
      ).not.toThrow();
    });
  });

  // ── maxResults ─────────────────────────────────────────────────────────────

  describe("maxResults", () => {
    it("defaults to 10 when not provided", () => {
      const result = SearchVideosSchema.parse({ query: "test" });
      expect(result.maxResults).toBe(10);
    });

    it("accepts a valid number", () => {
      const result = SearchVideosSchema.parse({
        query: "test",
        maxResults: 25,
      });
      expect(result.maxResults).toBe(25);
    });

    it("coerces a string number", () => {
      const result = SearchVideosSchema.parse({
        query: "test",
        maxResults: "20",
      });
      expect(result.maxResults).toBe(20);
    });

    it("rejects 0", () => {
      expect(() =>
        SearchVideosSchema.parse({ query: "test", maxResults: 0 })
      ).toThrow("Must return at least 1 result");
    });

    it("rejects more than 50", () => {
      expect(() =>
        SearchVideosSchema.parse({ query: "test", maxResults: 51 })
      ).toThrow("Cannot exceed 50 results");
    });

    it("rejects a float", () => {
      expect(() =>
        SearchVideosSchema.parse({ query: "test", maxResults: 1.5 })
      ).toThrow("Must be a whole number");
    });
  });

  // ── offset ─────────────────────────────────────────────────────────────────

  describe("offset", () => {
    it("defaults to 0 when not provided", () => {
      const result = SearchVideosSchema.parse({ query: "test" });
      expect(result.offset).toBe(0);
    });

    it("accepts a valid offset", () => {
      const result = SearchVideosSchema.parse({ query: "test", offset: 10 });
      expect(result.offset).toBe(10);
    });

    it("coerces a string number", () => {
      const result = SearchVideosSchema.parse({ query: "test", offset: "5" });
      expect(result.offset).toBe(5);
    });

    it("rejects a negative offset", () => {
      expect(() =>
        SearchVideosSchema.parse({ query: "test", offset: -1 })
      ).toThrow("Cannot be negative");
    });

    it("rejects a float", () => {
      expect(() =>
        SearchVideosSchema.parse({ query: "test", offset: 1.5 })
      ).toThrow("Must be a whole number");
    });
  });

  // ── uploadDateFilter ───────────────────────────────────────────────────────

  describe("uploadDateFilter", () => {
    it("is optional", () => {
      const result = SearchVideosSchema.parse({ query: "test" });
      expect(result.uploadDateFilter).toBeUndefined();
    });

    it.each(["hour", "today", "week", "month", "year"])(
      'accepts "%s"',
      (filter) => {
        const result = SearchVideosSchema.parse({
          query: "test",
          uploadDateFilter: filter,
        });
        expect(result.uploadDateFilter).toBe(filter);
      }
    );

    it("rejects an invalid filter value", () => {
      expect(() =>
        SearchVideosSchema.parse({
          query: "test",
          uploadDateFilter: "yesterday",
        })
      ).toThrow();
    });
  });

  // ── strict ─────────────────────────────────────────────────────────────────

  describe("strict", () => {
    it("rejects unknown keys", () => {
      expect(() =>
        SearchVideosSchema.parse({ query: "test", unknownKey: "value" })
      ).toThrow();
    });
  });
});
