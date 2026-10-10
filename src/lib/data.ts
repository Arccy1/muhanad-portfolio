// Server-side data access for public pages. All list/shape fields are
// serialized (JSON strings parsed) before reaching components.
import { prisma } from "./prisma";
import { parseJsonArray, parseJsonObject } from "./utils";
import type {
  CategoryDTO,
  CvExperienceDTO,
  ProjectDTO,
  ServiceDTO,
  SkillDTO,
  TestimonialDTO,
} from "./types";

type DbProject = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  categoryId: string | null;
  category?: { id: string; name: string; slug: string } | null;
  duration: string;
  software: string;
  videoUrl: string;
  thumbnailUrl: string;
  gallery: string;
  beforeAfter: string;
  process: string;
  tags: string;
  client: string;
  year: string;
  featured: boolean;
  published: boolean;
  order: number;
  createdAt: Date;
};

export function serializeProject(p: DbProject): ProjectDTO {
  const beforeAfter = parseJsonObject<{ before?: string; after?: string }>(p.beforeAfter);
  const process = parseJsonArray(p.process) as { title?: string; description?: string }[];
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    shortDescription: p.shortDescription,
    description: p.description,
    category: p.category ? { id: p.category.id, name: p.category.name, slug: p.category.slug } : null,
    duration: p.duration,
    software: parseJsonArray(p.software) as string[],
    videoUrl: p.videoUrl,
    thumbnailUrl: p.thumbnailUrl,
    gallery: parseJsonArray(p.gallery) as string[],
    beforeAfter:
      beforeAfter && beforeAfter.before && beforeAfter.after
        ? { before: beforeAfter.before, after: beforeAfter.after }
        : null,
    process: process
      .filter((s) => s && typeof s === "object")
      .map((s) => ({ title: String(s.title ?? ""), description: String(s.description ?? "") })),
    tags: parseJsonArray(p.tags) as string[],
    client: p.client,
    year: p.year,
    featured: p.featured,
    published: p.published,
    order: p.order,
    createdAt: p.createdAt.toISOString(),
  };
}

export async function getProjects(opts?: {
  categorySlug?: string;
  featured?: boolean;
  includeUnpublished?: boolean;
  take?: number;
}): Promise<ProjectDTO[]> {
  const projects = await prisma.project.findMany({
    where: {
      ...(opts?.featured !== undefined ? { featured: opts.featured } : {}),
      ...(opts?.includeUnpublished ? {} : { published: true }),
      ...(opts?.categorySlug ? { category: { slug: opts.categorySlug } } : {}),
    },
    include: { category: { select: { id: true, name: true, slug: true } } },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    ...(opts?.take ? { take: opts.take } : {}),
  });
  return projects.map(serializeProject);
}

export async function getProjectBySlug(slug: string): Promise<ProjectDTO | null> {
  const project = await prisma.project.findUnique({
    where: { slug },
    include: { category: { select: { id: true, name: true, slug: true } } },
  });
  return project ? serializeProject(project) : null;
}

export async function getAllProjectSlugs(): Promise<{ slug: string }[]> {
  return prisma.project.findMany({ where: { published: true }, select: { slug: true } });
}

export async function getCategories(): Promise<CategoryDTO[]> {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { projects: { where: { published: true } } } } },
  });
  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    subcategories: parseJsonArray(c.subcategories) as string[],
    order: c.order,
    projectCount: c._count.projects,
  }));
}

export async function getServices(): Promise<ServiceDTO[]> {
  const services = await prisma.service.findMany({ orderBy: { order: "asc" } });
  return services.map((s) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    icon: s.icon,
    order: s.order,
  }));
}

export async function getSkills(): Promise<SkillDTO[]> {
  const skills = await prisma.skill.findMany({ orderBy: { order: "asc" } });
  return skills.map((s) => ({ id: s.id, name: s.name, level: s.level, order: s.order }));
}

export async function getTestimonials(): Promise<TestimonialDTO[]> {
  const testimonials = await prisma.testimonial.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
  });
  return testimonials.map((t) => ({
    id: t.id,
    name: t.name,
    role: t.role,
    avatarUrl: t.avatarUrl,
    rating: t.rating,
    content: t.content,
    order: t.order,
  }));
}

export async function getCvExperience(): Promise<CvExperienceDTO[]> {
  const rows = await prisma.cvExperience.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });
  return rows.map((r) => ({
    id: r.id,
    role: r.role,
    org: r.org,
    period: r.period,
    points: parseJsonArray(r.points) as string[],
    order: r.order,
  }));
}

/** Fetch published projects by ids, preserving the given id order. */
export async function getProjectsByIds(ids: string[]): Promise<ProjectDTO[]> {
  if (ids.length === 0) return [];
  const rows = await prisma.project.findMany({
    where: { id: { in: ids }, published: true },
    include: { category: { select: { id: true, name: true, slug: true } } },
  });
  const byId = new Map(rows.map((r) => [r.id, r]));
  return ids
    .map((id) => byId.get(id))
    .filter((r): r is NonNullable<typeof r> => Boolean(r))
    .map(serializeProject);
}
