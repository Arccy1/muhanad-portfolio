import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCvExperience, getProjects, getProjectsByIds, getServices, getSkills } from "@/lib/data";
import { getSiteContent, getSocials } from "@/lib/content";
import { parseJsonArray } from "@/lib/utils";
import PrintButton from "@/components/cv/PrintButton";
import Reveal from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "CV",
  description: "Curriculum vitae of Muhanad Wael Mahdy — video editor and motion designer.",
};

export default async function CvPage() {
  const [content, skills, services, allProjects, experience] = await Promise.all([
    getSiteContent(),
    getSkills(),
    getServices(),
    getProjects(),
    getCvExperience(),
  ]);
  const socials = getSocials(content);

  // "Selected Projects": admin-picked projects; falls back to the first
  // five published projects when nothing is selected.
  const pickedIds = parseJsonArray(content["cv.projectIds"]) as string[];
  const projects =
    pickedIds.length > 0 ? await getProjectsByIds(pickedIds) : allProjects.slice(0, 5);

  const tools = content["cv.tools"]
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const languages = content["cv.languages"]
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const stats = [
    { label: "Years", value: content["stats.years"] },
    { label: "Projects", value: content["stats.projects"] },
    { label: "Clients", value: content["stats.clients"] },
    { label: "Views", value: content["stats.views"] },
  ];

  const contactLinks = [
    { label: socials.email, href: `mailto:${socials.email}` },
    { label: "WhatsApp", href: socials.whatsapp },
    { label: "Instagram", href: socials.instagram },
    { label: "LinkedIn", href: socials.linkedin },
  ];

  return (
    <section className="relative overflow-hidden pb-24 pt-32 lg:pt-40">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[780px] -translate-x-1/2 rounded-full bg-brand-900/30 blur-[150px]"
      />

      <div className="relative mx-auto max-w-4xl px-5 sm:px-8">
        {/* Toolbar (screen only) */}
        <div className="no-print mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-brand-400"
          >
            <ArrowLeft size={16} /> Back to site
          </Link>
          <PrintButton />
        </div>

        {/* CV sheet — deliberately literal paper colors so it prints perfectly
            from any theme */}
        <Reveal>
          <div className="rounded-2xl border border-black/10 bg-[#ffffff] p-7 text-[#18181b] shadow-card sm:p-10 lg:p-12">
            {/* Header */}
            <header>
              <h1 className="font-display text-4xl uppercase tracking-wide sm:text-5xl">
                Muhanad Wael Mahdy
              </h1>
              <p className="mt-1 font-display text-lg uppercase tracking-[0.3em] text-brand-600">
                Video Editor &amp; Motion Designer
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#52525b]">
                {contactLinks.map((c) => (
                  <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer" className="hover:text-brand-600">
                    {c.label}
                  </a>
                ))}
              </div>
              <div className="mt-5 h-[3px] w-16 rounded bg-brand-600" />
            </header>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label} className="rounded-xl border border-black/10 bg-[#fafafa] px-3 py-3 text-center">
                  <p className="font-display text-2xl text-brand-600">{s.value}</p>
                  <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#71717a]">{s.label}</p>
                </div>
              ))}
            </div>

            <Section title="Profile">
              <p className="text-sm leading-relaxed text-[#3f3f46]">{content["about.intro"]}</p>
            </Section>

            <Section title="Experience">
              <div className="space-y-5">
                {experience.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <h3 className="text-sm font-semibold text-[#18181b]">{exp.role}</h3>
                      <span className="text-xs font-semibold text-brand-600">{exp.period}</span>
                    </div>
                    {exp.org ? <p className="text-xs text-[#71717a]">{exp.org}</p> : null}
                    <ul className="mt-2 list-disc space-y-1 pl-4 text-sm leading-relaxed text-[#3f3f46]">
                      {exp.points.map((point, i) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                  </div>
                ))}
                {experience.length === 0 && (
                  <p className="text-sm text-[#71717a]">Experience coming soon.</p>
                )}
              </div>
            </Section>

            <Section title="Selected Projects">
              <div className="space-y-2.5">
                {projects.map((p) => (
                  <div key={p.id} className="flex flex-wrap items-baseline justify-between gap-x-3 border-b border-black/5 pb-2.5 last:border-0">
                    <p className="text-sm font-medium text-[#18181b]">
                      {p.title}
                      {p.client ? <span className="font-normal text-[#71717a]"> — {p.client}</span> : null}
                    </p>
                    <p className="text-xs text-[#71717a]">
                      {[p.category?.name, p.year].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                ))}
              </div>
            </Section>

            <div className="grid gap-8 sm:grid-cols-2">
              <div>
                <Section title="Core Skills">
                  <div className="space-y-2.5">
                    {skills.map((s) => (
                      <div key={s.id}>
                        <div className="flex items-baseline justify-between text-xs">
                          <span className="font-medium text-[#3f3f46]">{s.name}</span>
                          <span className="text-[#71717a]">{s.level}%</span>
                        </div>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#e4e4e7]">
                          <div className="h-full rounded-full bg-brand-600" style={{ width: `${s.level}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>

                <Section title="Software">
                  <ul className="space-y-1.5 text-sm text-[#3f3f46]">
                    {tools.map((tool) => (
                      <li key={tool} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
                        {tool}
                      </li>
                    ))}
                  </ul>
                </Section>
              </div>

              <div>
                <Section title="Services">
                  <ul className="space-y-1.5 text-sm text-[#3f3f46]">
                    {services.map((s) => (
                      <li key={s.id} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
                        {s.title}
                      </li>
                    ))}
                  </ul>
                </Section>

                <Section title="Languages">
                  <ul className="space-y-1.5 text-sm text-[#3f3f46]">
                    {languages.map((lang) => (
                      <li key={lang} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
                        {lang}
                      </li>
                    ))}
                  </ul>
                </Section>

                <Section title="Contact">
                  <p className="text-sm text-[#3f3f46]">{socials.email}</p>
                  <p className="mt-1 text-xs text-[#71717a]">References available on request.</p>
                </Section>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 flex items-center gap-2 font-display text-lg uppercase tracking-[0.2em] text-[#18181b]">
        <span className="h-4 w-1 rounded bg-brand-600" />
        {title}
      </h2>
      {children}
    </section>
  );
}
