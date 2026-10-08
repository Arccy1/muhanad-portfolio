import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import ProjectCard from "@/components/portfolio/ProjectCard";
import type { ProjectDTO } from "@/lib/types";

export default function FeaturedProjects({ projects }: { projects: ProjectDTO[] }) {
  if (projects.length === 0) return null;

  return (
    <section id="featured" className="relative py-24 lg:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 top-40 h-[400px] w-[400px] rounded-full bg-brand-900/30 blur-[140px]"
      />
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            kicker="Featured Work"
            title={<>SELECTED <span className="text-gradient">PROJECTS</span></>}
            description="A cut of my best work — from viral short-form to cinematic long-form storytelling."
          />
          <Reveal delay={0.15}>
            <Link
              href="/portfolio"
              className="group inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-zinc-400 transition hover:text-brand-400"
            >
              View All Projects
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {projects.map((project, i) => (
            <Reveal key={project.id} delay={0.08 * i}>
              <ProjectCard project={project} className="h-full" />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
