// src/tools/__tests__/getPlaylistUrls.tool.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../utils/spawn-promise.js", () => ({
  spawnPromise: vi.fn(),
}));

import { getPlaylistUrls } from "../getPlaylistUrls.js";
import { spawnPromise } from "../../utils/spawn-promise.js";

const mockSpawn = vi.mocked(spawnPromise);

function buildOutput(videos: { title: string; url: string }[]) {
  return videos.map((v) => `${v.title}\n${v.url}`).join("\n");
}

const MOCK_VIDEOS = [
  { title: "Track One", url: "https://www.youtube.com/watch?v=aaa111" },
  { title: "Track Two", url: "https://www.youtube.com/watch?v=bbb222" },
  { title: "Track Three", url: "https://www.youtube.com/watch?v=ccc333" },
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getPlaylistUrls", () => {
  describe("input validation", () => {
    it("throws on invalid URL", async () => {
      await expect(getPlaylistUrls("not-a-url")).rejects.toThrow("Invalid");
    });

    it("throws when yt-dlp returns empty string", async () => {
      mockSpawn.mockResolvedValue("");
      await expect(
        getPlaylistUrls("https://www.youtube.com/playlist?list=abc")
      ).rejects.toThrow("No videos found");
    });

    it("throws when yt-dlp returns only whitespace", async () => {
      mockSpawn.mockResolvedValue("   ");
      await expect(
        getPlaylistUrls("https://www.youtube.com/playlist?list=abc")
      ).rejects.toThrow("No videos found");
    });

    it("throws when no valid title/url pairs are parsed", async () => {
      mockSpawn.mockResolvedValue("only one line");
      await expect(
        getPlaylistUrls("https://www.youtube.com/playlist?list=abc")
      ).rejects.toThrow("No videos found");
    });
  });

  describe("result parsing", () => {
    it("returns correct total count", async () => {
      mockSpawn.mockResolvedValue(buildOutput(MOCK_VIDEOS));
      const result = JSON.parse(
        await getPlaylistUrls("https://www.youtube.com/playlist?list=abc")
      );
      expect(result.total).toBe(3);
    });

    it("returns correct video titles", async () => {
      mockSpawn.mockResolvedValue(buildOutput(MOCK_VIDEOS));
      const result = JSON.parse(
        await getPlaylistUrls("https://www.youtube.com/playlist?list=abc")
      );
      expect(result.videos[0].title).toBe("Track One");
      expect(result.videos[1].title).toBe("Track Two");
      expect(result.videos[2].title).toBe("Track Three");
    });

    it("returns correct video URLs", async () => {
      mockSpawn.mockResolvedValue(buildOutput(MOCK_VIDEOS));
      const result = JSON.parse(
        await getPlaylistUrls("https://www.youtube.com/playlist?list=abc")
      );
      expect(result.videos[0].url).toBe(
        "https://www.youtube.com/watch?v=aaa111"
      );
      expect(result.videos[1].url).toBe(
        "https://www.youtube.com/watch?v=bbb222"
      );
      expect(result.videos[2].url).toBe(
        "https://www.youtube.com/watch?v=ccc333"
      );
    });

    it("trims whitespace from titles and urls", async () => {
      mockSpawn.mockResolvedValue(
        "  Track One  \n  https://www.youtube.com/watch?v=aaa111  "
      );
      const result = JSON.parse(
        await getPlaylistUrls("https://www.youtube.com/playlist?list=abc")
      );
      expect(result.videos[0].title).toBe("Track One");
      expect(result.videos[0].url).toBe(
        "https://www.youtube.com/watch?v=aaa111"
      );
    });

    it("skips incomplete pairs", async () => {
      mockSpawn.mockResolvedValue(
        buildOutput(MOCK_VIDEOS.slice(0, 2)) + "\nDangling Title"
      );
      const result = JSON.parse(
        await getPlaylistUrls("https://www.youtube.com/playlist?list=abc")
      );
      expect(result.total).toBe(2);
    });

    it("returns valid JSON string", async () => {
      mockSpawn.mockResolvedValue(buildOutput(MOCK_VIDEOS));
      const raw = await getPlaylistUrls(
        "https://www.youtube.com/playlist?list=abc"
      );
      expect(() => JSON.parse(raw)).not.toThrow();
    });
  });

  describe("yt-dlp args", () => {
    it("calls yt-dlp with --flat-playlist and --no-download", async () => {
      mockSpawn.mockResolvedValue(buildOutput(MOCK_VIDEOS));
      await getPlaylistUrls("https://www.youtube.com/playlist?list=abc");
      const [cmd, args] = mockSpawn.mock.calls[0];
      expect(cmd).toBe("yt-dlp");
      expect(args).toContain("--flat-playlist");
      expect(args).toContain("--no-download");
    });

    it("passes the url to yt-dlp", async () => {
      mockSpawn.mockResolvedValue(buildOutput(MOCK_VIDEOS));
      await getPlaylistUrls("https://www.youtube.com/playlist?list=abc");
      const [, args] = mockSpawn.mock.calls[0];
      expect(args).toContain("https://www.youtube.com/playlist?list=abc");
    });

    it("prints title and url", async () => {
      mockSpawn.mockResolvedValue(buildOutput(MOCK_VIDEOS));
      await getPlaylistUrls("https://www.youtube.com/playlist?list=abc");
      const [, args] = mockSpawn.mock.calls[0];
      expect(args).toContain("%(title)s");
      expect(args).toContain("%(url)s");
    });
  });
});
