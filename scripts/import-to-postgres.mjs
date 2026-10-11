// One-time migration: import the JSON data backup into PostgreSQL.
// Ids are preserved, so relations (project <-> rating etc.) keep working.
import { PrismaClient } from "@prisma/client";
import fs from "node:fs";

const backup = JSON.parse(fs.readFileSync("prisma/data-backup.json", "utf8"));
const prisma = new PrismaClient();

const counts = [];
for (const [key, rows] of Object.entries(backup)) {
  if (!Array.isArray(rows) || rows.length === 0 || key === "exportedAt") continue;
  const model = {
    adminUsers: "adminUser",
    categories: "category",
    projects: "project",
    services: "service",
    skills: "skill",
    testimonials: "testimonial",
    cvExperience: "cvExperience",
    ratings: "rating",
    siteContent: "siteContent",
    contactMessages: "contactMessage",
  }[key];
  if (!model) continue;
  for (const row of rows) {
    await prisma[model].create({ data: row });
  }
  counts.push(`${key}: ${rows.length}`);
}

console.log("imported ->", counts.join(", "));
await prisma.$disconnect();
