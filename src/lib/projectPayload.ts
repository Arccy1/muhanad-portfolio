// Shared normalizer for project create/update payloads coming from the admin form.
import { toJsonArray, slugify } from "./utils";

export type ProjectInput = {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  categoryId: string | null;
  duration: string;
  software: string;
  videoUrl: string;
  thumbnailUrl: string;
  gallery: string;
  beforeAfter: string;
  process: string;
  clientQuote: string;
  results: string;
  tags: string;
  client: string;
  year: string;
  featured: boolean;
  published: boolean;
  order: number;
};

export function normalizeProjectBody(body: Record<string, unknown>): ProjectInput | { error: string } {
  const title = String(body.title ?? "").trim();
  if (!title) return { error: "Title is required." };

  const slug = slugify(String(body.slug ?? "") || title) || `project-${Date.now()}`;

  const beforeAfterRaw = body.beforeAfter as { before?: unknown; after?: unknown } | string | undefined;
  let beforeAfter = "{}";
  if (typeof beforeAfterRaw === "string" && beforeAfterRaw.trim()) {
    beforeAfter = beforeAfterRaw;
  } else if (beforeAfterRaw && typeof beforeAfterRaw === "object") {
    const before = String(beforeAfterRaw.before ?? "").trim();
    const after = String(beforeAfterRaw.after ?? "").trim();
    if (before && after) beforeAfter = JSON.stringify({ before, after });
  }

  const processRaw = body.process;
  let process = "[]";
  if (Array.isArray(processRaw)) {
    process = JSON.stringify(
      processRaw
        .map((s) => {
          const step = s as { title?: unknown; description?: unknown };
          return { title: String(step?.title ?? ""), description: String(step?.description ?? "") };
        })
        .filter((s) => s.title || s.description)
    );
  } else if (typeof processRaw === "string" && processRaw.trim()) {
    process = processRaw;
  }

  return {
    title,
    slug,
    shortDescription: String(body.shortDescription ?? "").trim(),
    description: String(body.description ?? "").trim(),
    categoryId: body.categoryId ? String(body.categoryId) : null,
    duration: String(body.duration ?? "").trim(),
    software: toJsonArray(body.software),
    videoUrl: String(body.videoUrl ?? "").trim(),
    thumbnailUrl: String(body.thumbnailUrl ?? "").trim(),
    gallery: toJsonArray(body.gallery),
    beforeAfter,
    process,
    clientQuote: String(body.clientQuote ?? "").trim().slice(0, 500),
    results: JSON.stringify(
      (Array.isArray(body.results) ? body.results : [])
        .map((r) => ({
          label: String((r as { label?: unknown })?.label ?? "").trim().slice(0, 80),
          value: String((r as { value?: unknown })?.value ?? "").trim().slice(0, 40),
        }))
        .filter((r) => r.label || r.value)
    ),
    tags: toJsonArray(body.tags),
    client: String(body.client ?? "").trim(),
    year: String(body.year ?? "").trim(),
    featured: Boolean(body.featured),
    published: body.published === undefined ? true : Boolean(body.published),
    order: Number.isFinite(Number(body.order)) ? Number(body.order) : 0,
  };
}

/** Ensure a slug is unique; appends -2, -3, ... when taken. */
export async function uniqueSlug(
  slug: string,
  prisma: { project: { findFirst: (args: { where: { slug: string; id?: { not: string } } }) => Promise<unknown> } },
  excludeId?: string
): Promise<string> {
  let candidate = slug;
  let counter = 2;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.project.findFirst({
      where: { slug: candidate, ...(excludeId ? { id: { not: excludeId } } : {}) },
    });
    if (!existing) return candidate;
    candidate = `${slug}-${counter++}`;
  }
}
