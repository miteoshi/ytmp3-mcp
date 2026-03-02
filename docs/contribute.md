# Contributing to ytmp3-mcp

Thanks for your interest in contributing! Here's everything you need to get started.

---

## Setup

```bash
git clone https://github.com/miteoshi/ytmp3-mcp.git
cd ytmp3-mcp
npm install
```

You'll also need `yt-dlp` and `ffmpeg` installed locally to run the server without Docker:

```bash
# Mac
brew install yt-dlp ffmpeg

# Windows
winget install yt-dlp ffmpeg

# Linux
sudo apt install ffmpeg && pip install yt-dlp
```

---

## Project structure

```
src/
├── index.mts              ← MCP server entry, routes tool calls
├── tools/                 ← Tool definitions + handlers
├── schema/                ← Zod input schemas
├── utils/                 ← spawn-promise, validate, downloads, tool-execute
└── __tests__/             ← Vitest tests
```

---

## Running locally

```bash
npx tsx src/index.mts
```

---

## Tests

```bash
npm test          # run once
npx vitest        # watch mode
```

Tests mock `spawnPromise` so no real yt-dlp calls happen. Always write tests for any new tool or utility you add.

---

## Adding a new tool

1. **Schema** — create `src/schema/yourTool.ts` with a Zod object schema
2. **Tool** — create `src/tools/yourTool.ts`, export the tool definition and handler
3. **Register** — add it to `src/tools/index.ts` in the `tools` array and `handleTool` switch
4. **Tests** — add `src/__tests__/yourTool.test.ts`

---

## Workflow

This repo protects `main` — you can't push directly. Always use a branch and PR:

```bash
git checkout -b your-feature
# make changes
git add .
git commit -m "description of change"
git push origin your-feature
```

Then open a PR on GitHub. CI runs tests automatically — the PR can only be merged when tests pass.

---

## Guidelines

- Keep tools focused — one tool, one job
- Validate all input with Zod in the schema file
- Never `await` long-running processes in tool handlers — use detached spawn so the MCP connection doesn't time out
- Match the existing code style