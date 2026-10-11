import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  Clapperboard,
  Cpu,
  Layers,
  User,
} from "lucide-react";
import { getAllProjectSlugs, getProjectBySlug, getProjects } from "@/lib/data";
import { getSiteContent } from "@/lib/content";
import { asset, cn } from "@/lib/utils";
import VideoPlayer from "@/components/portfolio/VideoPlayer";
import BeforeAfterSlider from "@/components/portfolio/BeforeAfterSlider";
import GalleryGrid from "@/components/portfolio/GalleryGrid";
import ProjectCard from "@/components/portfolio/ProjectCard";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import CTABand from "@/components/home/CTABand";

export const dynamic = "force-dynamic";

type Props = { params: { slug: string } };

// Pre-renders every published project page (required for static export builds;
// ignored during dynamic server rendering).
export async function generateStaticParams() {
  const slugs = await getAllProjectSlugs();
  return slugs.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await getProjectBySlug(params.slug);
  if (!project) return { title: "Project not found" };
  return {
    title: project.title,
    description: project.shortDescription || project.description.slice(0, 150),
    openGraph: {
      title: project.title,
      description: project.shortDescription,
      images: project.thumbnailUrl ? [{ url: asset(project.thumbnailUrl) }] : undefined,
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  const project = await getProjectBySlug(params.slug);
  if (!project) notFound();

  const [content, siblings] = await Promise.all([getSiteContent(), getProjects()]);
  const index = siblings.findIndex((p) => p.id === project.id);
  const prev = index > 0 ? siblings[index - 1] : null;
  const next = index >= 0 && index < siblings.length - 1 ? siblings[index + 1] : null;
  const related = siblings
    .filter((p) => p.id !== project.id && p.category?.slug === project.category?.slug)
    .slice(0, 3);

  return (
    <>
      <article className="relative overflow-hidden pb-20 pt-32 lg:pt-40">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-brand-900/30 blur-[150px]"
        />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-brand-400"
            >
              <ArrowLeft size={16} /> Back to Portfolio
            </Link>
          </Reveal>

          {/* Header */}
          <Reveal delay={0.05} className="mt-8">
            <div className="flex flex-wrap items-center gap-3">
              {project.category && (
                <span className="rounded-full border border-brand-500/40 bg-brand-600/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-brand-400">
                  {project.category.name}
                </span>
              )}
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-[11px] uppercase tracking-wider text-zinc-500"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="heading-display mt-6 max-w-4xl text-5xl text-white sm:text-6xl lg:text-7xl">
              {project.title}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-zinc-400">
              {project.shortDescription}
            </p>
          </Reveal>

          {/* Player */}
          <Reveal delay={0.12} className="mt-10">
            {project.videoUrl ? (
              <VideoPlayer src={project.videoUrl} poster={asset(project.thumbnailUrl)} title={project.title} />
            ) : (
              <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-ink-800">
                {project.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={asset(project.thumbnailUrl)} alt="" className="h-full w-full object-cover opacity-40" loading="lazy" />
                ) : null}
                <div className="relative z-10 text-center">
                  <Clapperboard size={40} className="mx-auto text-brand-500" />
                  <p className="mt-4 font-display text-2xl tracking-wide text-white">PRIVATE LINK AVAILABLE ON REQUEST</p>
                  <p className="mt-2 text-sm text-zinc-500">Client NDA — full video shared during project discussions.</p>
                </div>
              </div>
            )}
          </Reveal>

          {/* Meta + description */}
          <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_340px]">
            <Reveal>
              <h2 className="heading-display text-3xl text-white">
                ABOUT THE <span className="text-gradient">PROJECT</span>
              </h2>
              <p className="mt-5 leading-relaxed text-zinc-400">{project.description}</p>

              {project.process.length > 0 && (
                <div className="mt-12">
                  <h2 className="heading-display text-3xl text-white">
                    EDITING <span className="text-gradient">PROCESS</span>
                  </h2>
                  <ol className="mt-7 space-y-6">
                    {project.process.map((step, i) => (
                      <li key={i} className="relative flex gap-5 rounded-2xl border border-white/8 bg-white/[0.02] p-5 transition hover:border-brand-500/40">
                        <span className="heading-display text-4xl text-brand-500/80">0{i + 1}</span>
                        <div>
                          <h3 className="font-semibold text-white">{step.title}</h3>
                          <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">{step.description}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </Reveal>

            {/* Case study: results + client quote */}
            {(project.results.length > 0 || project.clientQuote) && (
              <Reveal delay={0.05} className="mt-12">
                <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
                  {project.results.length > 0 && (
                    <div className="grid gap-4 sm:grid-cols-3">
                      {project.results.map((r, i) => (
                        <div key={i} className="glass rounded-2xl p-5 text-center">
                          <p className="font-display text-3xl text-brand-400">{r.value}</p>
                          <p className="mt-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">{r.label}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {project.clientQuote && (
                    <blockquote
                      className={cn(
                        "glass relative rounded-2xl p-6",
                        project.results.length === 0 && "sm:col-span-2"
                      )}
                    >
                      <p className="text-sm leading-relaxed text-zinc-200">&ldquo;{project.clientQuote}&rdquo;</p>
                      <footer className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-brand-400">
                        {project.client || "Client"} — verified feedback
                      </footer>
                    </blockquote>
                  )}
                </div>
              </Reveal>
            )}

            {/* Sidebar */}
            <Reveal delay={0.1}>
              <aside className="glass sticky top-24 space-y-5 rounded-2xl p-6">
                <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">Project Info</h2>
                <MetaRow icon={<User size={16} />} label="Client" value={project.client || "—"} />
                <MetaRow icon={<Calendar size={16} />} label="Year" value={project.year || "—"} />
                <MetaRow icon={<Clock size={16} />} label="Duration" value={project.duration || "—"} />
                <MetaRow
                  icon={<Layers size={16} />}
                  label="Category"
                  value={project.category?.name ?? "—"}
                />
                <div>
                  <p className="flex items-center gap-2.5 text-sm text-zinc-500">
                    <Cpu size={16} className="text-brand-400" /> Software Used
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {project.software.map((sw) => (
                      <span
                        key={sw}
                        className="rounded-md border border-brand-500/25 bg-brand-600/10 px-2.5 py-1 text-xs text-brand-300"
                      >
                        {sw}
                      </span>
                    ))}
                  </div>
                </div>
                <Link
                  href="/contact"
                  className="mt-2 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-3 text-sm font-semibold uppercase tracking-widest text-onbrand shadow-glow transition hover:shadow-glow-lg"
                >
                  Start a Similar Project <ArrowRight size={15} />
                </Link>
              </aside>
            </Reveal>
          </div>

          {/* Before / After */}
          {project.beforeAfter && (
            <div className="mt-20">
              <SectionHeading
                kicker="Color Grading"
                title={
                  <>
                    BEFORE &amp; <span className="text-gradient">AFTER</span>
                  </>
                }
                description="Drag the handle to compare the raw footage against the final graded edit."
              />
              <Reveal delay={0.1} className="mt-9">
                <BeforeAfterSlider before={asset(project.beforeAfter.before)} after={asset(project.beforeAfter.after)} />
              </Reveal>
            </div>
          )}

          {/* Gallery */}
          {project.gallery.length > 0 && (
            <div className="mt-20">
              <SectionHeading
                kicker="Frames"
                title={
                  <>
                    GALLERY &amp; <span className="text-gradient">STILLS</span>
                  </>
                }
              />
              <Reveal delay={0.1} className="mt-9">
                <GalleryGrid images={project.gallery.map(asset)} title={project.title} />
              </Reveal>
            </div>
          )}

          {/* Prev / Next */}
          <div className="mt-20 grid gap-4 sm:grid-cols-2">
            {prev ? <SiblingCard label="Previous Project" project={prev} align="left" /> : <div />}
            {next ? <SiblingCard label="Next Project" project={next} align="right" /> : <div />}
          </div>

          {/* Related */}
          {related.length > 0 && (
            <div className="mt-24">
              <SectionHeading
                kicker="More Like This"
                title={
                  <>
                    RELATED <span className="text-gradient">PROJECTS</span>
                  </>
                }
              />
              <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((p, i) => (
                  <Reveal key={p.id} delay={0.06 * i}>
                    <ProjectCard project={p} className="h-full" />
                  </Reveal>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>

      <CTABand heading={content["cta.heading"]} subtext={content["cta.subtext"]} />
    </>
  );
}

function MetaRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 pb-3">
      <span className="flex items-center gap-2.5 text-sm text-zinc-500">
        <span className="text-brand-400">{icon}</span>
        {label}
      </span>
      <span className="text-sm font-medium text-zinc-200">{value}</span>
    </div>
  );
}

function SiblingCard({
  label,
  project,
  align,
}: {
  label: string;
  project: { slug: string; title: string; category?: { name: string } | null };
  align: "left" | "right";
}) {
  return (
    <Link
      href={`/portfolio/${project.slug}`}
      className={`glass group flex flex-col rounded-2xl p-6 transition hover:border-brand-500/50 ${
        align === "right" ? "items-end text-right" : ""
      }`}
    >
      <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-500">{label}</span>
      <span className="mt-2 font-display text-2xl tracking-wide text-white transition group-hover:text-brand-400">
        {project.title}
      </span>
      {project.category && <span className="mt-1 text-xs text-zinc-500">{project.category.name}</span>}
    </Link>
  );
}
