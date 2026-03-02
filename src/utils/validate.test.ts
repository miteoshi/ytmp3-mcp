// src/utils/validate.test.ts
import { describe, it, expect } from "vitest";
import { normalizeTime } from "./validate.js";

describe("normalizeTime", () => {
  it("converts MM:SS to HH:MM:SS", () => {
    expect(normalizeTime("1:30")).toBe("00:01:30");
  });

  it("converts raw seconds", () => {
    expect(normalizeTime("90s")).toBe("00:01:30");
  });

  it("pads HH:MM:SS correctly", () => {
    expect(normalizeTime("1:01:30")).toBe("01:01:30");
  });

  it("throws on invalid format", () => {
    expect(() => normalizeTime("abc")).toThrow();
  });
});
