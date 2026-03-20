// src/schema/getPlaylistUrls.ts
import { z } from "zod";

export const GetPlaylistUrlsSchema = z
  .object({
    url: z.string().url().describe("Full YouTube playlist URL"),
  })
  .strict();
