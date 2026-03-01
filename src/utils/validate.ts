// src/utils/validate.ts

export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function isYouTubeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname.includes("youtube.com") ||
      parsed.hostname.includes("youtu.be")
    );
  } catch {
    return false;
  }
}

/**
 * Normalizes any supported time input into HH:MM:SS for yt-dlp.
 *
 * Accepts:
 *   "90s"      → "00:01:30"
 *   "1:30"     → "00:01:30"   (MM:SS)
 *   "1:01:30"  → "01:01:30"   (HH:MM:SS, already valid)
 *
 * Throws if the input cannot be parsed, so callers get a clear error
 * rather than silently passing a bad timestamp to yt-dlp.
 */
export function normalizeTime(input: string): string {
  if (!input || typeof input !== "string") {
    throw new Error(`Invalid time value: ${JSON.stringify(input)}`);
  }

  const trimmed = input.trim();

  // Raw seconds: "90s"
  if (/^\d+s$/.test(trimmed)) {
    const totalSeconds = parseInt(trimmed, 10);
    return secondsToHMS(totalSeconds);
  }

  // MM:SS  →  HH:MM:SS
  if (/^\d{1,2}:\d{2}$/.test(trimmed)) {
    const [m, s] = trimmed.split(":").map(Number);
    return secondsToHMS(m * 60 + s);
  }

  // HH:MM:SS — validate and re-pad just to be safe
  if (/^\d{1,2}:\d{2}:\d{2}$/.test(trimmed)) {
    const [h, m, s] = trimmed.split(":").map(Number);
    if (m >= 60 || s >= 60) {
      throw new Error(
        `Invalid time "${trimmed}": minutes and seconds must be < 60`
      );
    }
    return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
  }

  throw new Error(
    `Unrecognized time format "${trimmed}". Use HH:MM:SS, MM:SS, or Ns (e.g. "90s")`
  );
}

function secondsToHMS(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
    throw new Error(`Invalid seconds value: ${totalSeconds}`);
  }
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}
