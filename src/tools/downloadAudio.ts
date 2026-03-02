// src/tools/downloadAudio.ts
import { DownloadAudioSchema } from "../schema/downloadAudio.js";
import { spawnPromise } from "../utils/spawn-promise.js";
import { handleToolExecution } from "../utils/tool-execute.js";
import { validateUrl } from "../utils/validate.js";
import crypto from "crypto";

import path from "path";
import { getSafeFilename } from "../utils/transforms.js";
import { getDownloadsDir } from "../utils/downloads.js";

export const downloadAudioTool = {
  name: "download_audio",
  description: `USE THIS TOOL ONLY WHEN USER ASKS TO DOWNLOAD AUDIO FROM A VIDEO URL.

Extracts and downloads audio from a video URL in best quality (MP3).
Files are saved to ~/Downloads by default, named after the video title.

If the user provides startTime and endTime, only that section is downloaded.
Accepted time formats: HH:MM:SS, MM:SS, or raw seconds like "90s".

Args:
  - url (string): Full video URL from any supported platform
  - startTime (string, optional): Start of audio clip e.g. "1:30", "00:01:30", "90s"
  - endTime (string, optional): End of audio clip e.g. "2:00", "00:02:00", "120s"

Returns: Success message with the download path.

Use when: User wants an audio-only file (music, podcasts, speeches).
Don't use when: User needs video with visuals.`,
  inputSchema: DownloadAudioSchema,
  annotations: {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  },
};

function normalizeTime(input: string): string {
  const trimmed = input.trim();

  if (/^\d+s$/.test(trimmed)) {
    const total = parseInt(trimmed, 10);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
  }

  if (/^\d{1,2}:\d{2}$/.test(trimmed)) {
    const [m, s] = trimmed.split(":").map(Number);
    const h = Math.floor(m / 60);
    const rem = m % 60;
    return [h, rem, s].map((v) => String(v).padStart(2, "0")).join(":");
  }

  if (/^\d{1,2}:\d{2}:\d{2}$/.test(trimmed)) {
    const [h, m, s] = trimmed.split(":").map(Number);
    return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
  }

  throw new Error(
    `Unrecognized time format: "${trimmed}". Use HH:MM:SS, MM:SS, or Ns (e.g. "90s")`
  );
}



export async function downloadAudio(
  url: string,
  startTime?: string,
  endTime?: string
): Promise<string> {
  if (!validateUrl(url)) {
    throw new Error("Invalid or unsupported URL format");
  }

  if (!!startTime !== !!endTime) {
    throw new Error(
      "Both startTime and endTime must be provided together, or neither."
    );
  }

  const normalizedStart = startTime ? normalizeTime(startTime) : undefined;
  const normalizedEnd = endTime ? normalizeTime(endTime) : undefined;
  const id = crypto.randomBytes(4).toString("hex");
  const filename = `${await getSafeFilename(url)}_${id}`;
const outputTemplate = path.join(getDownloadsDir(), `${filename}.%(ext)s`);

  const args = [
    "--ignore-config",
    "--no-check-certificate",
    "--no-mtime",
    "-x",
    "--audio-format",
    "mp3",
    "--audio-quality",
    "0",
    "--output",
    outputTemplate,
  ];

  if (normalizedStart && normalizedEnd) {
    args.push(
      "--download-sections",
      `*${normalizedStart}-${normalizedEnd}`,
      "--force-keyframes-at-cuts"
    );
  }

  args.push(url);

  await spawnPromise("yt-dlp", args);

  const finalPath = path.join(getDownloadsDir(), `${filename}.mp3`);
  return `Audio downloaded successfully to ${finalPath}`;
}

export async function handleDownloadAudioTool(args: unknown) {
  const validated = DownloadAudioSchema.parse(args);

  const startTime = validated.startTime ?? validated.start;
  const endTime = validated.endTime ?? validated.end;

  return handleToolExecution(
    () => downloadAudio(validated.url, startTime, endTime),
    "Error downloading audio. Please check the URL and try again."
  );
}
