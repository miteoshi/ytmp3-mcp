import { describe, it, expect, vi, beforeEach } from "vitest";
import { searchVideos } from "../searchVideo.js";

// Mock spawnPromise so no real yt-dlp calls happen
vi.mock("../../utils/spawn-promise.js", () => ({
  spawnPromise: vi.fn(),
}));

import { spawnPromise } from "../../utils/spawn-promise.js";
const mockSpawn = vi.mocked(spawnPromise);

// Helper to build fake yt-dlp output — 4 lines per video
function buildYtDlpOutput(
  videos: { title: string; id: string; uploader: string; duration: string }[]
) {
  return videos
    .map((v) => `${v.title}\n${v.id}\n${v.uploader}\n${v.duration}`)
    .join("\n");
}

const MOCK_VIDEOS = [
  { title: "Video One", id: "aaa111", uploader: "Channel A", duration: "180" },
  { title: "Video Two", id: "bbb222", uploader: "Channel B", duration: "240" },
  {
    title: "Video Three",
    id: "ccc333",
    uploader: "Channel C",
    duration: "300",
  },
  { title: "Video Four", id: "ddd444", uploader: "Channel D", duration: "120" },
  { title: "Video Five", id: "eee555", uploader: "Channel E", duration: "360" },
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe("searchVideos", () => {
  // ── input validation ───────────────────────────────────────────────────────

  describe("input validation", () => {
    it("throws on empty query", async () => {
      await expect(searchVideos("")).rejects.toThrow(
        "Search query cannot be empty"
      );
    });

    it("throws on whitespace-only query", async () => {
      await expect(searchVideos("   ")).rejects.toThrow(
        "Search query cannot be empty"
      );
    });

    it("throws when maxResults is 0", async () => {
      await expect(searchVideos("test", 0)).rejects.toThrow(
        "Number of results must be between 1 and 50"
      );
    });

    it("throws when maxResults exceeds 50", async () => {
      await expect(searchVideos("test", 51)).rejects.toThrow(
        "Number of results must be between 1 and 50"
      );
    });

    it("throws on negative offset", async () => {
      await expect(searchVideos("test", 10, -1)).rejects.toThrow(
        "Offset cannot be negative"
      );
    });
  });

  // ── empty results ──────────────────────────────────────────────────────────

  describe("empty results", () => {
    it("returns empty JSON when yt-dlp returns nothing", async () => {
      mockSpawn.mockResolvedValue("");
      const result = await searchVideos("test");
      expect(JSON.parse(result)).toEqual({ videos: [], total: 0 });
    });

    it("returns empty JSON when yt-dlp returns only whitespace", async () => {
      mockSpawn.mockResolvedValue("   ");
      const result = await searchVideos("test");
      expect(JSON.parse(result)).toEqual({ videos: [], total: 0 });
    });
  });

  // ── parsing ────────────────────────────────────────────────────────────────

  describe("result parsing", () => {
    it("correctly parses yt-dlp output into video objects", async () => {
      mockSpawn.mockResolvedValue(buildYtDlpOutput([MOCK_VIDEOS[0]]));
      const result = JSON.parse(await searchVideos("test", 10));

      expect(result.videos[0]).toEqual({
        title: "Video One",
        id: "aaa111",
        url: "https://www.youtube.com/watch?v=aaa111",
        uploader: "Channel A",
        duration: "180",
      });
    });

    it("builds correct YouTube URL from id", async () => {
      mockSpawn.mockResolvedValue(buildYtDlpOutput([MOCK_VIDEOS[0]]));
      const result = JSON.parse(await searchVideos("test"));
      expect(result.videos[0].url).toBe(
        "https://www.youtube.com/watch?v=aaa111"
      );
    });

    it("returns correct count and total", async () => {
      mockSpawn.mockResolvedValue(buildYtDlpOutput(MOCK_VIDEOS));
      const result = JSON.parse(await searchVideos("test", 5));
      expect(result.total).toBe(5);
      expect(result.count).toBe(5);
    });
  });

  // ── pagination ─────────────────────────────────────────────────────────────

  describe("pagination", () => {
    it("applies offset correctly", async () => {
      mockSpawn.mockResolvedValue(buildYtDlpOutput(MOCK_VIDEOS));
      const result = JSON.parse(await searchVideos("test", 2, 2));
      expect(result.videos[0].title).toBe("Video Three");
      expect(result.offset).toBe(2);
    });

    it("sets has_more true when more results exist", async () => {
      mockSpawn.mockResolvedValue(buildYtDlpOutput(MOCK_VIDEOS));
      const result = JSON.parse(await searchVideos("test", 2, 0));
      expect(result.has_more).toBe(true);
      expect(result.next_offset).toBe(2);
    });

    it("sets has_more false on last page", async () => {
      mockSpawn.mockResolvedValue(buildYtDlpOutput(MOCK_VIDEOS));
      const result = JSON.parse(await searchVideos("test", 5, 0));
      expect(result.has_more).toBe(false);
      expect(result.next_offset).toBeUndefined();
    });

    it("returns empty when offset exceeds total results", async () => {
      mockSpawn.mockResolvedValue(buildYtDlpOutput(MOCK_VIDEOS.slice(0, 2)));
      const result = JSON.parse(await searchVideos("test", 10, 50));
      expect(JSON.parse(await searchVideos("test", 10, 50))).toEqual({
        videos: [],
        total: 0,
      });
    });
  });

  // ── uploadDateFilter ───────────────────────────────────────────────────────

  describe("uploadDateFilter", () => {
    it("includes upload_date_filter in response when provided", async () => {
      mockSpawn.mockResolvedValue(buildYtDlpOutput([MOCK_VIDEOS[0]]));
      const result = JSON.parse(await searchVideos("test", 10, 0, "today"));
      expect(result.upload_date_filter).toBe("today");
    });

    it("uses YouTube URL with sp param when filter is provided", async () => {
      mockSpawn.mockResolvedValue(buildYtDlpOutput([MOCK_VIDEOS[0]]));
      await searchVideos("test", 10, 0, "week");

      const calledArgs = mockSpawn.mock.calls[0][1];
      expect(calledArgs[0]).toContain("youtube.com/results");
      expect(calledArgs[0]).toContain("EgIIAw");
    });

    it("uses ytsearch prefix when no filter provided", async () => {
      mockSpawn.mockResolvedValue(buildYtDlpOutput([MOCK_VIDEOS[0]]));
      await searchVideos("test");

      const calledArgs = mockSpawn.mock.calls[0][1];
      expect(calledArgs[0]).toContain("ytsearch");
    });

    it("does not include upload_date_filter in response when not provided", async () => {
      mockSpawn.mockResolvedValue(buildYtDlpOutput([MOCK_VIDEOS[0]]));
      const result = JSON.parse(await searchVideos("test"));
      expect(result.upload_date_filter).toBeUndefined();
    });
  });

  // ── yt-dlp args ────────────────────────────────────────────────────────────

  describe("yt-dlp args", () => {
    it("calls yt-dlp with title, id, uploader, duration print flags", async () => {
      mockSpawn.mockResolvedValue(buildYtDlpOutput([MOCK_VIDEOS[0]]));
      await searchVideos("baby keem");

      const calledArgs = mockSpawn.mock.calls[0][1];
      expect(calledArgs).toContain("title");
      expect(calledArgs).toContain("id");
      expect(calledArgs).toContain("uploader");
      expect(calledArgs).toContain("duration");
    });

    it("trims whitespace from query before passing to yt-dlp", async () => {
      mockSpawn.mockResolvedValue(buildYtDlpOutput([MOCK_VIDEOS[0]]));
      await searchVideos("  baby keem  ");

      const calledArgs = mockSpawn.mock.calls[0][1];
      expect(calledArgs[0]).toContain("baby keem");
      expect(calledArgs[0]).not.toContain("  baby keem  ");
    });
  });
});
