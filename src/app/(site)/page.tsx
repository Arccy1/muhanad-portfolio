import Hero from "@/components/home/Hero";
import { StatsBand } from "@/components/home/StatsBand";
import SoftwareMarquee from "@/components/home/SoftwareMarquee";
import FeaturedProjects from "@/components/home/FeaturedProjects";
import SkillsSection from "@/components/home/SkillsSection";
import ShowreelTeaser from "@/components/home/ShowreelTeaser";
import TestimonialsCarousel from "@/components/home/TestimonialsCarousel";
import CTABand from "@/components/home/CTABand";
import { getProjects, getSkills, getTestimonials } from "@/lib/data";
import { getSiteContent } from "@/lib/content";
import { asset } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [content, featured, skills, testimonials] = await Promise.all([
    getSiteContent(),
    getProjects({ featured: true, take: 4 }),
    getSkills(),
    getTestimonials(),
  ]);

  const stats = [
    { label: "Years Experience", value: content["stats.years"] },
    { label: "Projects Completed", value: content["stats.projects"] },
    { label: "Happy Clients", value: content["stats.clients"] },
    { label: "Total Views", value: content["stats.views"] },
  ];

  return (
    <>
      <Hero
        badge={content["hero.badge"]}
        heading={content["hero.heading"]}
        subheading={content["hero.subheading"]}
        description={content["hero.description"]}
        videoUrl={content["hero.videoUrl"] || undefined}
      />
      <StatsBand stats={stats} />
      <SoftwareMarquee />
      <FeaturedProjects projects={featured} />
      <SkillsSection skills={skills} />
      <ShowreelTeaser
        title={content["showreel.title"]}
        description={content["showreel.description"]}
        videoUrl={content["showreel.videoUrl"] || undefined}
        poster={asset("/images/showreel-poster.svg")}
      />
      <TestimonialsCarousel testimonials={testimonials} />
      <CTABand heading={content["cta.heading"]} subtext={content["cta.subtext"]} />
    </>
  );
}
