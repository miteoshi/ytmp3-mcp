// src/tools/downloadAudio.test.ts
import { describe, it, expect, vi } from "vitest";
import { downloadAudio } from "./downloadAudio.js";

// Mock spawnPromise so no real yt-dlp calls happen
vi.mock("../utils/spawn-promise.js", () => ({
  spawnPromise: vi.fn().mockResolvedValue("Baby Keem - Mock Title"),
}));

describe("downloadAudio", () => {
  it("throws on invalid URL", async () => {
    await expect(downloadAudio("not-a-url")).rejects.toThrow("Invalid");
  });

  it("throws when only startTime is provided", async () => {
    await expect(
      downloadAudio("https://youtube.com/watch?v=abc", "1:00", undefined)
    ).rejects.toThrow("Both startTime and endTime");
  });

  it("resolves with a path on valid input", async () => {
    const result = await downloadAudio("https://youtube.com/watch?v=abc");
    expect(result).toContain(".mp3");
  });
});
