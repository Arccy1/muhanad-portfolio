import { prisma } from "./prisma";

/** Fallback values used when a key has not been customized in the admin. */
export const DEFAULT_CONTENT: Record<string, string> = {
  "hero.badge": "SHOWREEL 2026 — AVAILABLE FOR FREELANCE",
  "hero.heading": "MUHANAD WAEL MAHDY",
  "hero.subheading": "VIDEO EDITOR & MOTION DESIGNER",
  "hero.description":
    "I transform raw footage into engaging visual stories through editing, motion graphics, sound design, and creative storytelling.",
  "stats.years": "6+",
  "stats.projects": "250+",
  "stats.clients": "80+",
  "stats.views": "50M+",
  "showreel.title": "MY SHOWREEL",
  "showreel.description":
    "Selected work showcasing my editing style, motion graphics, transitions, visual effects, and storytelling.",
  "showreel.videoUrl": "",
  "about.intro":
    "I'm Muhanad Wael Mahdy, a video editor and motion designer turning raw footage into stories people finish, share and remember.",
  "about.approach":
    "Great editing is invisible. I start every project by understanding the story and the audience, then let rhythm and pacing do the heavy lifting.",
  "about.image": "/images/profile.svg",
  "cta.heading": "LET'S CREATE SOMETHING GREAT",
  "cta.subtext": "Have a project in mind? Tell me about it — I usually reply within 24 hours.",
  "socials.email": "mohannadwael1000@gmail.com",
  "socials.whatsapp": "https://wa.me/971500000000",
  "socials.instagram": "https://instagram.com/muhanad.mahdy",
  "socials.youtube": "https://youtube.com/@muhanadmahdy",
  "socials.tiktok": "https://tiktok.com/@muhanad.mahdy",
  "socials.behance": "https://behance.net/muhanadmahdy",
  "socials.linkedin": "https://linkedin.com/in/muhanad-mahdy",
  "cv.languages": "Arabic — Native, English — Fluent",
  "cv.tools":
    "Adobe Premiere Pro, Adobe After Effects, DaVinci Resolve, Adobe Photoshop, Adobe Audition",
  // JSON array of project ids shown in "Selected Projects" on the CV.
  // Empty = fall back to the first five published projects.
  "cv.projectIds": "",
};

export type SiteContent = Record<string, string>;

/** Read all site content rows, merged over the defaults. */
export async function getSiteContent(): Promise<SiteContent> {
  try {
    const rows = await prisma.siteContent.findMany();
    const map: SiteContent = { ...DEFAULT_CONTENT };
    for (const row of rows) map[row.key] = row.value;
    return map;
  } catch {
    // Database not reachable yet — render with defaults rather than crashing.
    return { ...DEFAULT_CONTENT };
  }
}

export function getSocials(content: SiteContent) {
  return {
    email: content["socials.email"],
    whatsapp: content["socials.whatsapp"],
    instagram: content["socials.instagram"],
    youtube: content["socials.youtube"],
    tiktok: content["socials.tiktok"],
    behance: content["socials.behance"],
    linkedin: content["socials.linkedin"],
  };
}
