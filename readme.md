<p align="center">
  <img src="./assets/logo.png" width="500" alt="ytmp3-mcp logo" />
</p>

> A Model Context Protocol (MCP) server that lets your AI download YouTube audio and search videos — powered by `yt-dlp` and `ffmpeg`, shipped as a Docker image.

---

## What it does

| Tool | Description |
|------|-------------|
| `download_audio` | Downloads audio from any YouTube URL as MP3. Supports time-range clipping. |
| `search_videos` | Searches YouTube and returns titles, channels, durations, and URLs. |

More tools coming soon.

---

## Requirements

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) — for Docker usage
- Node.js 18+ — for running directly via npm/npx
- `yt-dlp` and `ffmpeg` installed on your system — for npm usage

---

### Important
If you want playlist download, keep the below as 'system prompt'

```
When a tool returns a list of video URLs, you MUST immediately call download_audio for each URL one by one without asking for confirmation or summarizing. Do not stop until every URL has been passed to download_audio.
```

## Docker (recommended, no setup)

### 1. Pull the image

```bash
docker pull piyush9969/ytmp3-mcp:latest
```

### 2. Add to your MCP client config

```json
{
  "mcpServers": {
    "ytmp3-mcp": {
      "command": "docker",
      "args": [
        "run", "--rm", "-i",
        "-v", "/Users/yourname/Downloads:/downloads",
        "-e", "DOWNLOADS_DIR=/downloads",
        "piyush9969/ytmp3-mcp:latest"
      ]
    }
  }
}
```

**Update the volume path for your OS:**

| OS | Volume path |
|----|-------------|
| Mac | `/Users/yourname/Downloads:/downloads` |
| Linux | `/home/yourname/Downloads:/downloads` |
| Windows | `C:/Users/yourname/Downloads:/downloads` |

---

## Build from source (Docker)

If you want to build the image yourself instead of pulling:

```bash
git clone https://github.com/miteoshi/ytmp3-mcp.git
cd ytmp3-mcp
docker build -t ytmp3-mcp .
```

Then use the same `mcp.json` as above but replace the image name:

```json
{
  "mcpServers": {
    "ytmp3-mcp": {
      "command": "docker",
      "args": [
        "run", "--rm", "-i",
        "-v", "/Users/yourname/Downloads:/downloads",
        "-e", "DOWNLOADS_DIR=/downloads",
        "ytmp3-mcp"
      ]
    }
  }
}
```

---

## Run directly via npm (no Docker)

Requires `yt-dlp` and `ffmpeg` installed on your machine:

**Mac:**
```bash
brew install yt-dlp ffmpeg
```

**Windows:**
```bash
winget install yt-dlp ffmpeg
```

**Linux:**
```bash
sudo apt install ffmpeg
pip install yt-dlp
```

Then clone and install:

```bash
git clone https://github.com/miteoshi/ytmp3-mcp.git
cd ytmp3-mcp
npm install
```

Add to your MCP client config:

```json
{
  "mcpServers": {
    "ytmp3-mcp": {
      "command": "npx",
      "args": [
        "tsx",
        "/path/to/ytmp3-mcp/src/index.mts"
      ]
    }
  }
}
```

Replace `/path/to/ytmp3-mcp` with the actual path where you cloned the repo.

---

## LM Studio config location

`Settings → LLM → MCP Servers → Edit config`

---

## Usage

Once connected, just talk to your LLM naturally:

```
Download the audio from https://www.youtube.com/watch?v=...
```

```
Download only 1:00 to 2:30 from https://www.youtube.com/watch?v=...
```

```
Search YouTube for "baby keem new music"
```

Downloaded files appear in your `~/Downloads` folder, named after the video title.

### Supported time formats for clipping

| Format | Example |
|--------|---------|
| `MM:SS` | `1:30` |
| `HH:MM:SS` | `00:01:30` |
| Seconds | `90s` |

---

## How it works

```
LLM client
    └── MCP call
            └── docker run  (or npx tsx)
                    └── yt-dlp + ffmpeg
                            └── ~/Downloads
```

Each tool call spawns a fresh process, runs the command, and exits. No persistent container, no background process.

---
adding more features..
