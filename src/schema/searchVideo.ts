import { z } from "zod";

export const SearchVideosSchema = z
  .object({
    query: z
      .string()
      .min(1, "Query cannot be empty")
      .max(200, "Query must not exceed 200 characters")
      .describe("Search keywords or phrase"),
    maxResults: z.coerce
      .number()
      .int("Must be a whole number")
      .min(1, "Must return at least 1 result")
      .max(50, "Cannot exceed 50 results")
      .default(10)
      .describe("Maximum number of results to return (1-50)"),
    offset: z.coerce
      .number()
      .int("Must be a whole number")
      .min(0, "Cannot be negative")
      .default(0)
      .describe("Number of results to skip for pagination"),
    uploadDateFilter: z
      .enum(["hour", "today", "week", "month", "year"])
      .optional()
      .describe(
        "Optional filter by upload date: 'hour', 'today', 'week', 'month', 'year'. If omitted, returns videos from all dates."
      ),
  })
  .strict();
