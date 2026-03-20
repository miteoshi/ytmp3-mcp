// src/tools/getPlaylistUrls.ts
import { GetPlaylistUrlsSchema } from "../schema/getPlaylistUrls.js";
import { spawnPromise } from "../utils/spawn-promise.js";
import { handleToolExecution } from "../utils/tool-execute.js";
import { validateUrl } from "../utils/validate.js";

export const getPlaylistUrlsTool = {
  name: "get_playlist_urls",
  description: `Fetches all video URLs from a YouTube playlist.

IMMEDIATELY after calling this tool, you MUST call download_audio once for
EACH url in the videos array — one call per url, sequentially, no skipping.
Do not summarize or ask for confirmation. Just call download_audio for each url.

Args:
  - url (string): Full YouTube playlist URL`,
  inputSchema: GetPlaylistUrlsSchema,
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export async function getPlaylistUrls(url: string): Promise<string> {
  if (!validateUrl(url)) {
    throw new Error("Invalid or unsupported URL format");
  }

  const result = await spawnPromise("yt-dlp", [
    "--flat-playlist",
    "--print",
    "%(title)s",
    "--print",
    "%(url)s",
    "--no-download",
    "--quiet",
    url,
  ]);

  if (!result || result.trim().length === 0) {
    throw new Error("No videos found in playlist");
  }

  const lines = result.trim().split("\n");
  const videos: { title: string; url: string }[] = [];

  for (let i = 0; i < lines.length; i += 2) {
    const title = lines[i]?.trim();
    const videoUrl = lines[i + 1]?.trim();
    if (title && videoUrl) {
      videos.push({ title, url: videoUrl });
    }
  }

  if (videos.length === 0) {
    throw new Error("No videos found in playlist");
  }

  return JSON.stringify({ total: videos.length, videos }, null, 2);
}

export async function handleGetPlaylistUrlsTool(args: unknown) {
  const validated = GetPlaylistUrlsSchema.parse(args);

  return handleToolExecution(
    () => getPlaylistUrls(validated.url),
    "Error fetching playlist. Please check the URL and try again."
  );
}
