import { SearchVideosSchema } from "../schema/searchVideo.js";
import { spawnPromise } from "../utils/spawn-promise.js";
import { handleToolExecution } from "../utils/tool-execute.js";

const characterLimit = 25000;

export const searchTool = {
  name: "search_videos",
  description: `Search for videos on YouTube. Returns JSON with video results.

IMPORTANT: After receiving the results, you MUST display them to the user as a formatted markdown list. For each video show: title (bold), channel, duration in minutes:seconds, and the full URL. Do not summarize — show every video returned.

Args:
  - query (string): Search keywords
  - maxResults (number): Number of results to return (1-50, default: 10)
  - offset (number): Skip first N results for pagination (default: 0)
  - uploadDateFilter (enum, optional): 'hour', 'today', 'week', 'month', 'year'`,
  inputSchema: SearchVideosSchema,
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export type UploadDateFilter = "hour" | "today" | "week" | "month" | "year";

export interface SearchResult {
  title: string;
  id: string;
  url: string;
  uploader?: string;
  duration?: string;
}

const UPLOAD_DATE_FILTER_MAP: Record<UploadDateFilter, string> = {
  hour: "EgIIAQ%3D%3D",
  today: "EgIIAg%3D%3D",
  week: "EgIIAw%3D%3D",
  month: "EgIIBA%3D%3D",
  year: "EgIIBQ%3D%3D",
};

export async function searchVideos(
  query: string,
  maxResults: number = 10,
  offset: number = 0,
  uploadDateFilter?: UploadDateFilter
): Promise<string> {
  if (!query || query.trim().length === 0)
    throw new Error("Search query cannot be empty");
  if (maxResults < 1 || maxResults > 50)
    throw new Error("Number of results must be between 1 and 50");
  if (offset < 0) throw new Error("Offset cannot be negative");

  const cleanQuery = query.trim();
  const totalToFetch = maxResults + offset;

  let args: string[];

  if (uploadDateFilter && UPLOAD_DATE_FILTER_MAP[uploadDateFilter]) {
    const encodedQuery = encodeURIComponent(cleanQuery);
    const spParam = UPLOAD_DATE_FILTER_MAP[uploadDateFilter];
    const searchUrl = `https://www.youtube.com/results?search_query=${encodedQuery}&sp=${spParam}`;
    args = [
      searchUrl,
      "--flat-playlist",
      "--print",
      "title",
      "--print",
      "id",
      "--print",
      "uploader",
      "--print",
      "duration",
      "--no-download",
      "--quiet",
      "--playlist-end",
      String(totalToFetch),
    ];
  } else {
    args = [
      `ytsearch${totalToFetch}:${cleanQuery}`,
      "--print",
      "title",
      "--print",
      "id",
      "--print",
      "uploader",
      "--print",
      "duration",
      "--no-download",
      "--quiet",
    ];
  }

  const result = await spawnPromise("yt-dlp", args);

  if (!result || result.trim().length === 0)
    return JSON.stringify({ videos: [], total: 0 });

  const lines = result.trim().split("\n");
  const allResults: SearchResult[] = [];

  for (let i = 0; i < lines.length; i += 4) {
    if (i + 3 < lines.length) {
      const title = lines[i]?.trim();
      const id = lines[i + 1]?.trim();
      const uploader = lines[i + 2]?.trim();
      const duration = lines[i + 3]?.trim();

      if (title && id) {
        allResults.push({
          title,
          id,
          url: `https://www.youtube.com/watch?v=${id}`,
          uploader: uploader || "Unknown",
          duration: duration || "Unknown",
        });
      }
    }
  }

  const paginatedResults = allResults.slice(offset, offset + maxResults);
  if (paginatedResults.length === 0)
    return JSON.stringify({ videos: [], total: 0 });

  const hasMore = allResults.length > offset + maxResults;

  const response = {
    total: allResults.length,
    count: paginatedResults.length,
    offset,
    videos: paginatedResults,
    has_more: hasMore,
    ...(hasMore && { next_offset: offset + maxResults }),
    ...(uploadDateFilter && { upload_date_filter: uploadDateFilter }),
  };

  let output = JSON.stringify(response, null, 2);

  if (output.length > characterLimit) {
    const truncatedCount = Math.ceil(paginatedResults.length / 2);
    output = JSON.stringify(
      {
        ...response,
        count: truncatedCount,
        videos: paginatedResults.slice(0, truncatedCount),
        truncated: true,
      },
      null,
      2
    );
  }

  return output;
}

export async function handleSearchTool(args: any) {
  const validated = SearchVideosSchema.parse(args);

  return handleToolExecution(
    () =>
      searchVideos(
        validated.query,
        validated.maxResults,
        validated.offset,
        validated.uploadDateFilter
      ),
    "Error searching videos"
  );
}
