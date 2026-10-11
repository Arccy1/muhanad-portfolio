import fs from "node:fs";
import path from "node:path";

const LOG_DIR = path.join(process.cwd(), "logs");

/** Append an error line to logs/error.log (local error tracking). */
export function logError(source: string, error: unknown): void {
  try {
    fs.mkdirSync(LOG_DIR, { recursive: true });
    const message = error instanceof Error ? `${error.message}\n${error.stack ?? ""}` : String(error);
    const line = `[${new Date().toISOString()}] [${source}] ${message.replace(/\n+/g, " | ")}\n`;
    fs.appendFileSync(path.join(LOG_DIR, "error.log"), line);
  } catch {
    /* logging must never throw */
  }
}
