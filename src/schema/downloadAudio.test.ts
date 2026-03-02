// src/schema/downloadAudio.test.ts
import { describe, it, expect } from "vitest";
import { DownloadAudioSchema } from "./downloadAudio.js";

describe("DownloadAudioSchema", () => {
  it("accepts valid input", () => {
    expect(() =>
      DownloadAudioSchema.parse({ url: "https://youtube.com/watch?v=abc" })
    ).not.toThrow();
  });

  it("rejects invalid URL", () => {
    expect(() => DownloadAudioSchema.parse({ url: "not-a-url" })).toThrow();
  });

  it("rejects invalid time format", () => {
    expect(() =>
      DownloadAudioSchema.parse({
        url: "https://youtube.com/watch?v=abc",
        startTime: "abc",
      })
    ).toThrow();
  });

  it("accepts all time formats", () => {
    expect(() =>
      DownloadAudioSchema.parse({
        url: "https://youtube.com/watch?v=abc",
        startTime: "1:30",
        endTime: "90s",
      })
    ).not.toThrow();
  });
});
