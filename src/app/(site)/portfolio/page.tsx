import { Metadata } from "next";
import SectionHeading from "@/components/ui/SectionHeading";
import PortfolioGrid from "@/components/portfolio/PortfolioGrid";
import CTABand from "@/components/home/CTABand";
import { getCategories, getProjects } from "@/lib/data";
import { getSiteContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Browse video editing projects by category — short form, long form, commercial, motion graphics, gaming and social media.",
};

export default async function PortfolioPage() {
  const [projects, categories, content] = await Promise.all([
    getProjects(),
    getCategories(),
    getSiteContent(),
  ]);

  return (
    <>
      <section className="relative overflow-hidden pb-10 pt-40">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/3 h-[420px] w-[720px] rounded-full bg-brand-900/30 blur-[150px]"
        />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHeading
            kicker="Portfolio"
            title={
              <>
                THE <span className="text-gradient">WORK</span>
              </>
            }
            description="Every project below was cut, graded and mixed by me. Filter by category to explore the type of edit you need."
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8 lg:pb-32">
        <PortfolioGrid projects={projects} categories={categories} />
      </section>

      <CTABand heading={content["cta.heading"]} subtext={content["cta.subtext"]} />
    </>
  );
}
