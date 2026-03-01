import { spawnPromise } from "./spawn-promise.js";

/**
 * Fetches the video title and sanitizes it for use as a filename.
 * Falls back to a timestamp-based name if anything goes wrong.
 */

export async function getSafeFilename(url: string): Promise<string> {
  try {
    const title = await spawnPromise("yt-dlp", [
      "--print",
      "title",
      "--no-download",
      "--quiet",
      url,
    ]);

    const sanitized = title
      .trim()
      // Replace characters not allowed in filenames on Windows/Mac/Linux
      .replace(/[\/\\:*?"<>|]/g, "")
      // Collapse multiple spaces/dots
      .replace(/\s+/g, " ")
      .replace(/\.+/g, ".")
      // Trim leading/trailing spaces and dots
      .replace(/^[\s.]+|[\s.]+$/g, "")
      // Cap length to avoid hitting OS filename limits (255 bytes)
      .substring(0, 200);

    return sanitized.length > 0 ? sanitized : `audio_${Date.now()}`;
  } catch {
    return `audio_${Date.now()}`;
  }
}