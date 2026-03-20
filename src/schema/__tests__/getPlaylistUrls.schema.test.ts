// src/__tests__/getPlaylistUrls.schema.test.ts
import { describe, it, expect } from "vitest";
import { GetPlaylistUrlsSchema } from "../getPlaylistUrls.js"

describe("GetPlaylistUrlsSchema", () => {
  describe("url", () => {
    it("accepts a valid playlist URL", () => {
      expect(() =>
        GetPlaylistUrlsSchema.parse({
          url: "https://www.youtube.com/playlist?list=abc123",
        })
      ).not.toThrow();
    });

    it("accepts a video URL with playlist param", () => {
      expect(() =>
        GetPlaylistUrlsSchema.parse({
          url: "https://www.youtube.com/watch?v=abc&list=xyz",
        })
      ).not.toThrow();
    });

    it("rejects an invalid URL", () => {
      expect(() => GetPlaylistUrlsSchema.parse({ url: "not-a-url" })).toThrow();
    });

    it("rejects an empty string", () => {
      expect(() => GetPlaylistUrlsSchema.parse({ url: "" })).toThrow();
    });

    it("rejects missing url field", () => {
      expect(() => GetPlaylistUrlsSchema.parse({})).toThrow();
    });
  });

  describe("strict", () => {
    it("rejects unknown keys", () => {
      expect(() =>
        GetPlaylistUrlsSchema.parse({
          url: "https://www.youtube.com/playlist?list=abc123",
          extra: "field",
        })
      ).toThrow();
    });
  });
});
