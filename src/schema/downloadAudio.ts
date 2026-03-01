// src/schema/downloadAudio.ts
import { z } from "zod";

const timeString = z
  .string()
  .regex(
    /^(\d{1,2}:)?\d{1,2}:\d{2}$|^\d+s$/,
    'Format must be HH:MM:SS, MM:SS, or seconds like "90s"'
  );

export const DownloadAudioSchema = z.object({
  url: z.string().url().describe("Full video URL from any supported platform"),
  // Accept all common casings/aliases the LLM might send
  startTime: timeString
    .optional()
    .describe("Start time of the audio clip (e.g. 1:30, 00:01:30, 90s)"),
  endTime: timeString
    .optional()
    .describe("End time of the audio clip (e.g. 2:00, 00:02:00, 120s)"),
  start: timeString.optional(),
  end: timeString.optional(),
});
