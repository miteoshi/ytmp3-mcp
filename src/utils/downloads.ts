import os from "os";
import path from "path";

/**
 * Returns the downloads directory.
 * When running in Docker, DOWNLOADS_DIR is set to /downloads (mounted volume).
 * Locally it falls back to ~/Downloads.
 */
export function getDownloadsDir(): string {
  return process.env.DOWNLOADS_DIR ?? path.join(os.homedir(), "Downloads");
}
