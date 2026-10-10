/**
 * Seeds the database with demo content: admin user, categories, projects,
 * services, skills, testimonials, and editable site content.
 * Run: npm run db:seed
 */
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(readFileSync(join(ROOT, "prisma", "placeholder-manifest.json"), "utf8"));

const img = (p, fallback) => manifest.thumbs[p] ?? fallback ?? "/images/thumb-generic.svg";
const gallery = (p) => manifest.gallery[p] ?? [];
const ba = (p) => JSON.stringify(manifest.beforeAfter[p] ?? {});
const arr = (items) => JSON.stringify(items);

const SAMPLE_VIDEOS = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
];

const PROCESS_STEPS = {
  shortForm: [
    { title: "Hook-first assembly", description: "I cut the strongest 3 seconds to the front so the video earns the swipe-stop before anything else." },
    { title: "Rhythm & pacing", description: "Beat-synced cuts, punch-ins and speed ramps tuned to platform retention curves." },
    { title: "Captions & motion", description: "Kinetic captions, emoji accents and animated stickers designed for vertical viewing." },
    { title: "Sound design & mix", description: "Trend-mapped audio, SFX layering and a loudness-normalized final mix." },
  ],
  longForm: [
    { title: "Story structure", description: "Transcripts reviewed, selects pulled and a narrative arc mapped before any timeline exists." },
    { title: "Rough cut", description: "The full story assembled — pacing, order and flow refined with your feedback loops." },
    { title: "Fine cut & graphics", description: "Lower thirds, B-roll weaving, archival treatment and subtle motion graphics." },
    { title: "Color & mix", description: "Full color pass and dialogue-led sound mix with music, ambience and mastering." },
  ],
  commercial: [
    { title: "Brief & moodboard", description: "Brand goals, references and a visual direction locked before editing begins." },
    { title: "Editorial", description: "Product-led storytelling: hero shots, benefit beats and a CTA that lands." },
    { title: "Motion & polish", description: "Logo stings, animated text, beauty cleanup and seamless transitions." },
    { title: "Delivery", description: "Export matrix for every placement — broadcast, web, social and in-store." },
  ],
  motion: [
    { title: "Concept & styleframes", description: "Sketches and styleframes that define look, motion language and timing." },
    { title: "Design & rig", description: "Assets designed and rigged in After Effects for smooth, editable animation." },
    { title: "Animation", description: "Easing, overshoot and secondary motion — the details that make it feel alive." },
    { title: "Composite & grade", description: "Final composite with glow, grain and a grade that unifies every frame." },
  ],
  gaming: [
    { title: "Footage mining", description: "Hours of VODs scrubbed for the aces, clutches and reactions that carry a montage." },
    { title: "Sync editing", description: "Every kill, flash and headshot cut to the soundtrack — frame-accurate sync." },
    { title: "FX & transitions", description: "Shake, speed ramps, glitch transitions and impact frames that hit hard." },
    { title: "Audio mix", description: "Game audio ducked under music with punchy SFX on every elimination." },
  ],
  social: [
    { title: "Campaign strategy", description: "Deliverable plan per platform — formats, ratios, captions and posting cadence." },
    { title: "Batch editing", description: "Consistent branded templates so every post feels native to the feed and on-brand." },
    { title: "Optimization", description: "Hooks, thumbnails and captions A/B-ready for each platform's algorithm." },
    { title: "Handoff", description: "Organized exports, filenames and a delivery doc your team can post from." },
  ],
};

async function main() {
  console.log("Seeding database...");

  await prisma.contactMessage.deleteMany();
  await prisma.cvExperience.deleteMany();
  await prisma.project.deleteMany();
  await prisma.category.deleteMany();
  await prisma.service.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.siteContent.deleteMany();
  await prisma.adminUser.deleteMany();

  // ----- Admin user -----
  const email = process.env.ADMIN_EMAIL || "admin@muhanad.dev";
  const password = process.env.ADMIN_PASSWORD || "admin123";
  await prisma.adminUser.create({
    data: {
      email,
      name: process.env.ADMIN_NAME || "Muhanad Wael Mahdy",
      passwordHash: bcrypt.hashSync(password, 10),
    },
  });
  console.log(`  Admin user: ${email} / ${password}`);

  // ----- Categories -----
  const categoryData = [
    { name: "Short Form", slug: "short-form", description: "Scroll-stopping vertical edits built for retention.", subcategories: ["TikTok", "Instagram Reels", "YouTube Shorts"], order: 1 },
    { name: "Long Form", slug: "long-form", description: "Story-driven edits that hold attention for the full runtime.", subcategories: ["YouTube Videos", "Documentaries", "Podcasts"], order: 2 },
    { name: "Commercial", slug: "commercial", description: "Polished brand and product films that convert.", subcategories: ["Advertisements", "Product Videos", "Brand Videos"], order: 3 },
    { name: "Motion Graphics", slug: "motion-graphics", description: "Animated identities, typography and visual effects.", subcategories: ["Logo Animation", "Typography", "Visual Effects"], order: 4 },
    { name: "Gaming", slug: "gaming", description: "High-energy montages and esports edits cut to the frame.", subcategories: ["Gaming Highlights", "Montages", "Esports Videos"], order: 5 },
    { name: "Social Media", slug: "social-media", description: "Campaign-ready content packages for every platform.", subcategories: ["Content Editing", "Promotional Videos", "Social Campaigns"], order: 6 },
  ];
  const categories = {};
  for (const c of categoryData) {
    categories[c.slug] = await prisma.category.create({ data: { ...c, subcategories: arr(c.subcategories) } });
  }

  // ----- Projects -----
  const projects = [
    {
      slug: "neon-nights", title: "Neon Nights — TikTok Series", cat: "short-form",
      short: "A 12-episode vertical series with beat-synced cuts and kinetic captions that averaged 2M+ views per episode.",
      description: "Neon Nights was a midnight-city vertical series produced for a lifestyle creator. Every episode opens with a custom shot hook, rides a relentless beat-synced edit and closes on a cliffhanger caption designed to drive profile visits. I handled the full pipeline: edit, motion captions, sound design and platform-specific exports.",
      duration: "0:45", software: ["Premiere Pro", "After Effects", "Audition"], client: "Neon Lifestyle Media", year: "2025", featured: true,
      video: SAMPLE_VIDEOS[0], tags: ["TikTok", "Reels", "Kinetic Captions"],
    },
    {
      slug: "street-style-reels", title: "Street Style — Reels Pack", cat: "short-form",
      short: "Fashion reels pack with whip-pan transitions and speed ramps for a streetwear label's launch week.",
      description: "A batch of 20 reels produced for a streetwear drop. Each reel uses match-cut transitions between garments, hard music syncs and punchy text callouts for drop times. The pack lifted the label's average watch time by 42% across launch week.",
      duration: "0:30", software: ["Premiere Pro", "After Effects"], client: "Urban Thread Co.", year: "2025", featured: false,
      video: SAMPLE_VIDEOS[1], tags: ["Reels", "Fashion", "Transitions"],
    },
    {
      slug: "echoes-of-the-desert", title: "Echoes of the Desert — Documentary", cat: "long-form",
      short: "A 12-minute documentary following three falconers, graded for a warm cinematic desert palette.",
      description: "Echoes of the Desert is a short documentary I edited and graded from 40+ hours of raw footage. The structure intercuts three falconers' stories, building to a shared festival scene. Interview-led pacing, archival treatment for family photos and a score-driven final act.",
      duration: "12:40", software: ["Premiere Pro", "DaVinci Resolve", "Audition"], client: "Zajal Films", year: "2024", featured: true,
      video: SAMPLE_VIDEOS[4], tags: ["Documentary", "Color Grading", "Storytelling"],
    },
    {
      slug: "founders-journey", title: "The Founder's Journey — Podcast", cat: "long-form",
      short: "Weekly founder-interview podcast: multicam edits, animated chapters and a tight 40-minute runtime.",
      description: "Full post-production for a weekly founder interview show. I cut three cameras plus screen-share, removed tangents without losing warmth, added animated chapter cards and built a reusable motion template pack the client's team still uses.",
      duration: "48:15", software: ["Premiere Pro", "After Effects", "Audition"], client: "Majlis Podcast Network", year: "2025", featured: false,
      video: SAMPLE_VIDEOS[5], tags: ["Podcast", "Multicam", "YouTube"],
    },
    {
      slug: "pulse-energy-ad", title: "Pulse Energy — Product Ad", cat: "commercial",
      short: "A 60-second hero product film with liquid simulations, macro inserts and a punchy CTA sting.",
      description: "Pulse Energy's launch ad combined studio macro footage with fast-cut lifestyle sequences. I built the edit around a rising synth track, matched every can-spin to a beat hit and finished with a logo sting that became the brand's audio signature.",
      duration: "1:00", software: ["Premiere Pro", "After Effects", "DaVinci Resolve"], client: "Pulse Beverages", year: "2024", featured: true,
      video: SAMPLE_VIDEOS[2], tags: ["Advertisement", "Product", "Broadcast"],
    },
    {
      slug: "aurora-skincare", title: "Aurora Skincare — Brand Film", cat: "commercial",
      short: "Soft, luminous brand film — clean beauty grading and elegant typographic motion.",
      description: "A calm, premium brand film for Aurora's repositioning. Slow dissolves, soft-light grading and delicate typographic motion carry the story of the routine. Delivered in six aspect ratios for retail screens, web and social.",
      duration: "1:30", software: ["DaVinci Resolve", "After Effects", "Premiere Pro"], client: "Aurora Beauty", year: "2025", featured: false,
      video: SAMPLE_VIDEOS[6], tags: ["Brand Film", "Beauty", "Grading"],
    },
    {
      slug: "mwm-logo-reveal", title: "MWM Logo Reveal Pack", cat: "motion-graphics",
      short: "A trio of logo reveals — glass shatter, ink bleed and neon draw — fully templated.",
      description: "A personal R&D pack of three logo reveals exploring different motion languages. Each version ships as a drop-your-logo template with controllable colors and timing, plus a rendered 4K showcase reel.",
      duration: "0:12", software: ["After Effects", "Photoshop"], client: "Self-initiated", year: "2024", featured: false,
      video: SAMPLE_VIDEOS[7], tags: ["Logo Animation", "Template", "Branding"],
    },
    {
      slug: "kinetic-typography", title: "Kinetic Type — 'Create'", cat: "motion-graphics",
      short: "A 35-second kinetic typography piece driven entirely by voice-over rhythm.",
      description: "An experimental typography animation cut word-by-word to a spoken-word track. Every transition is motivated by the audio — scale hits on consonants, wipes on breaths — composited with film grain and a duotone grade.",
      duration: "0:35", software: ["After Effects", "Audition"], client: "Self-initiated", year: "2025", featured: false,
      video: "", tags: ["Typography", "Animation", "Experimental"],
    },
    {
      slug: "valorant-ace-montage", title: "Valorant — Ace Montage", cat: "gaming",
      short: "Frame-accurate ace montage with shake hits, speed ramps and glitch transitions.",
      description: "A community-favorite montage built from 60+ hours of submitted clips. Every elimination lands on a beat, every round break breathes. Custom impact frames, chromatic glitch transitions and a final ace rendered with a dramatic slow-mo finish.",
      duration: "2:15", software: ["Premiere Pro", "After Effects"], client: "Team Vanguard", year: "2025", featured: true,
      video: SAMPLE_VIDEOS[3], tags: ["Montage", "Esports", "Sync Editing"],
    },
    {
      slug: "fps-highlight-reel", title: "FPS Highlight Reel", cat: "gaming",
      short: "A streamer's best-of reel: 5 minutes, 40 clutches, zero dead frames.",
      description: "Year-end highlight reel for a partnered streamer. I scrubbed VOD archives to build a ranked shortlist, then edited the top 40 plays into a relentless five-minute cut with HUD-cleaned close-ups and animated stat callouts.",
      duration: "5:20", software: ["Premiere Pro", "After Effects", "Photoshop"], client: "Streamline Talent", year: "2024", featured: false,
      video: SAMPLE_VIDEOS[0], tags: ["Highlights", "Streaming", "Esports"],
    },
    {
      slug: "ramadan-campaign", title: "Ramadan Campaign — Social Series", cat: "social-media",
      short: "A 30-post campaign package with a consistent visual language across three platforms.",
      description: "Month-long Ramadan campaign for a food brand: daily posts, weekly recap edits and two hero films. I built a template system that kept every post on-brand while allowing same-day turnaround — 30 deliverables shipped on schedule.",
      duration: "0:20", software: ["Premiere Pro", "After Effects", "Photoshop"], client: "Bayt Foods", year: "2024", featured: false,
      video: SAMPLE_VIDEOS[1], tags: ["Campaign", "Templates", "Multi-platform"],
    },
    {
      slug: "launch-promo-pack", title: "App Launch — Promo Pack", cat: "social-media",
      short: "Launch-day promo set: teaser, countdown stories and a feature-explainer cut.",
      description: "A complete promo package for a fitness app launch — one teaser, three countdown stories, a 60-second feature explainer and a UGC-style cut. Screen-capture footage was treated with device frames, fluid transitions and an energetic grade.",
      duration: "0:60", software: ["After Effects", "Premiere Pro", "Audition"], client: "FitPulse App", year: "2025", featured: false,
      video: SAMPLE_VIDEOS[2], tags: ["Promotional", "App", "Social"],
    },
  ];

  const processKey = {
    "short-form": PROCESS_STEPS.shortForm,
    "long-form": PROCESS_STEPS.longForm,
    commercial: PROCESS_STEPS.commercial,
    "motion-graphics": PROCESS_STEPS.motion,
    gaming: PROCESS_STEPS.gaming,
    "social-media": PROCESS_STEPS.social,
  };

  for (let i = 0; i < projects.length; i++) {
    const p = projects[i];
    await prisma.project.create({
      data: {
        title: p.title,
        slug: p.slug,
        shortDescription: p.short,
        description: p.description,
        categoryId: categories[p.cat].id,
        duration: p.duration,
        software: arr(p.software),
        videoUrl: p.video,
        thumbnailUrl: img(p.slug),
        gallery: arr(gallery(p.slug)),
        beforeAfter: ba(p.slug),
        process: arr(processKey[p.cat]),
        tags: arr(p.tags),
        client: p.client,
        year: p.year,
        featured: p.featured,
        published: true,
        order: i,
      },
    });
  }
  console.log(`  ${projects.length} projects seeded`);

  // ----- Services -----
  const services = [
    { title: "Video Editing", description: "Full post-production — story assembly, pacing, transitions and a final cut that feels effortless.", icon: "film", order: 1 },
    { title: "Short-Form Content", description: "TikToks, Reels and Shorts engineered for retention: hooks, captions and beat-synced cuts.", icon: "smartphone", order: 2 },
    { title: "YouTube Editing", description: "Long-form videos with retention editing, B-roll weaving, thumbnails-ready frames and chapters.", icon: "youtube", order: 3 },
    { title: "Motion Graphics", description: "Logo animations, kinetic typography, lower thirds and animated explainers that elevate any edit.", icon: "sparkles", order: 4 },
    { title: "Commercial Editing", description: "Ads and brand films with broadcast-grade polish — from first assembly to final delivery matrix.", icon: "megaphone", order: 5 },
    { title: "Gaming Video Editing", description: "Montages, highlights and esports edits cut frame-accurately to music with custom effects.", icon: "gamepad-2", order: 6 },
    { title: "Color Grading", description: "Cinematic looks and consistent skin tones — from natural polish to full stylized grades.", icon: "palette", order: 7 },
    { title: "Sound Design", description: "Clean dialogue, layered SFX, music selection and a mix that makes every cut feel bigger.", icon: "audio-lines", order: 8 },
  ];
  for (const s of services) await prisma.service.create({ data: s });
  console.log(`  ${services.length} services seeded`);

  // ----- Skills -----
  const skills = [
    { name: "Video Editing", level: 96, order: 1 },
    { name: "Motion Graphics", level: 90, order: 2 },
    { name: "Color Grading", level: 88, order: 3 },
    { name: "Sound Design", level: 85, order: 4 },
    { name: "Visual Effects", level: 82, order: 5 },
    { name: "Storytelling", level: 93, order: 6 },
    { name: "Social Media Editing", level: 95, order: 7 },
  ];
  for (const s of skills) await prisma.skill.create({ data: s });
  console.log(`  ${skills.length} skills seeded`);

  // ----- CV experience + languages/tools -----
  const cvExperience = [
    {
      role: "Video Editor",
      org: "Reachhacks",
      period: "2024 — Present",
      points: JSON.stringify([
        "Editing short-form and long-form video content for Reachhacks — hooks, pacing, kinetic captions, sound design and multi-platform delivery.",
        "Building retention-driven edits that keep audiences watching from the first frame to the last.",
      ]),
      order: 1,
    },
    {
      role: "Freelance Video Editor & Motion Designer",
      org: "Self-employed · 2 years",
      period: "2024 — Present",
      points: JSON.stringify([
        "Delivering edits for creators and brands across TikTok, Reels, Shorts, YouTube, commercials and esports.",
        "Full post-production ownership: story assembly, pacing, color grading, sound design and platform-ready exports.",
      ]),
      order: 2,
    },
  ];
  for (const e of cvExperience) await prisma.cvExperience.create({ data: e });
  console.log(`  ${cvExperience.length} CV experience entries seeded`);

  // ----- Testimonials -----
  const avatars = manifest.avatars;
  const testimonials = [
    { name: "Sara Al-Rashid", role: "Founder, Neon Lifestyle Media", rating: 5, content: "Muhanad took our raw clips and turned them into a series our audience genuinely waits for. The hooks he builds are unfair — our average views tripled within a month." },
    { name: "James Miller", role: "Creative Director, Pulse Beverages", rating: 5, content: "The launch film he cut became our brand's signature. Broadcast polish, on time, with a delivery matrix for every screen we sell on. We've rebooked him for every campaign since." },
    { name: "Layla Kareem", role: "Producer, Zajal Films", rating: 5, content: "He found a story in 40 hours of footage that we couldn't see ourselves. The documentary's grade and pacing got us into two regional festivals." },
    { name: "Omar Farouk", role: "Content Creator, 1.2M subscribers", rating: 5, content: "Retention editing at another level. My average view duration went up 35% after switching to Muhanad, and I spend zero hours in the timeline now." },
    { name: "Emma Thompson", role: "Marketing Lead, Aurora Beauty", rating: 5, content: "Elegant, precise and fast. The brand film felt like it came from a big agency — but the process was personal, communicative and refreshingly simple." },
    { name: "Khalid Nasser", role: "Manager, Team Vanguard Esports", rating: 5, content: "Every clutch lands on the beat. Our montages get shared by the players themselves — that's the highest praise an esports edit can get." },
  ];
  for (let i = 0; i < testimonials.length; i++) {
    await prisma.testimonial.create({ data: { ...testimonials[i], avatarUrl: avatars[i], order: i + 1 } });
  }
  console.log(`  ${testimonials.length} testimonials seeded`);

  // ----- Site content -----
  const content = {
    "hero.badge": "SHOWREEL 2026 — AVAILABLE FOR FREELANCE",
    "hero.heading": "MUHANAD WAEL MAHDY",
    "hero.subheading": "VIDEO EDITOR & MOTION DESIGNER",
    "hero.description": "I transform raw footage into engaging visual stories through editing, motion graphics, sound design, and creative storytelling.",
    "stats.years": "6+",
    "stats.projects": "250+",
    "stats.clients": "80+",
    "stats.views": "50M+",
    "showreel.title": "MY SHOWREEL",
    "showreel.description": "Selected work showcasing my editing style, motion graphics, transitions, visual effects, and storytelling.",
    "showreel.videoUrl": SAMPLE_VIDEOS[4],
    "about.intro": "I'm Muhanad Wael Mahdy, a video editor and motion designer with 6+ years of experience turning raw footage into stories people finish, share and remember. My work spans short-form virality, long-form documentaries, commercials and esports montages — always with the same obsession: rhythm, emotion and polish in every frame.",
    "about.approach": "Great editing is invisible. I start every project by understanding the story and the audience, then let rhythm and pacing do the heavy lifting. Whether it's a 15-second Reel or a 12-minute documentary, the goal is the same: make people feel something before they realize they're watching an edit.",
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
  };
  for (const [key, value] of Object.entries(content)) {
    await prisma.siteContent.create({ data: { key, value } });
  }
  console.log(`  ${Object.keys(content).length} site content keys seeded`);

  // ----- Sample contact message -----
  await prisma.contactMessage.create({
    data: {
      name: "Demo Client",
      email: "client@example.com",
      projectType: "Short-Form Content",
      budget: "$500 – $1,000",
      message: "Hi Muhanad! We're launching a product next month and need a set of 6 short-form videos. Loved your Neon Nights series — can we discuss rates and timeline?",
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
