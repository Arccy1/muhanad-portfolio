// Shared utilities usable on server and client.

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Safely parse a JSON string field that should be an array. */
export function parseJsonArray(value: string | null | undefined): unknown[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Safely parse a JSON string field that should be an object. */
export function parseJsonObject<T = Record<string, unknown>>(value: string | null | undefined): T | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as T) : null;
  } catch {
    return null;
  }
}

/** Normalize "a, b, c" or JSON array input into a JSON string array. */
export function toJsonArray(input: unknown): string {
  if (Array.isArray(input)) return JSON.stringify(input.map(String).filter(Boolean));
  if (typeof input === "string") {
    const trimmed = input.trim();
    if (!trimmed) return "[]";
    if (trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return JSON.stringify(parsed.map(String).filter(Boolean));
      } catch {
        /* fall through to comma split */
      }
    }
    return JSON.stringify(trimmed.split(",").map((s) => s.trim()).filter(Boolean));
  }
  return "[]";
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Prefix internal media paths with the site's base path (GitHub Pages serves
 * the site under /muhanad-portfolio). Remote and data URLs pass through.
 * In normal (server) builds NEXT_PUBLIC_BASE_PATH is empty, so this is a no-op.
 */
export function asset(path?: string | null): string {
  if (!path) return "";
  if (/^(https?:|data:|mailto:|#)/i.test(path)) return path;
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
