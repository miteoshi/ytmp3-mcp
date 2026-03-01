FROM node:22-alpine

# Install yt-dlp and ffmpeg (ffmpeg is required for -x audio extraction)
RUN apk add --no-cache ffmpeg python3 curl && \
    curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && \
    chmod +x /usr/local/bin/yt-dlp

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY . .

# Compile TypeScript
RUN npx tsc

# Downloads will be mounted here from the host
VOLUME ["/downloads"]

CMD ["node", "dist/index.js"]