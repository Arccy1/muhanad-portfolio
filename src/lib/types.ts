// Serialized DTO types shared by server queries and client components.

export type CategoryDTO = {
  id: string;
  name: string;
  slug: string;
  description: string;
  subcategories: string[];
  order: number;
  projectCount?: number;
};

export type ProcessStep = { title: string; description: string };

export type ProjectDTO = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  category: { id: string; name: string; slug: string } | null;
  duration: string;
  software: string[];
  videoUrl: string;
  thumbnailUrl: string;
  gallery: string[];
  beforeAfter: { before: string; after: string } | null;
  process: ProcessStep[];
  tags: string[];
  client: string;
  year: string;
  featured: boolean;
  published: boolean;
  order: number;
  createdAt: string;
};

export type ServiceDTO = {
  id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
};

export type SkillDTO = { id: string; name: string; level: number; order: number };

export type TestimonialDTO = {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  rating: number;
  content: string;
  order: number;
};

export type MessageDTO = {
  id: string;
  name: string;
  email: string;
  projectType: string;
  budget: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export type CvExperienceDTO = {
  id: string;
  role: string;
  org: string;
  period: string;
  points: string[];
  order: number;
};
