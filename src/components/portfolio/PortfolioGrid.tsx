"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FolderOpen } from "lucide-react";
import ProjectCard from "./ProjectCard";
import type { CategoryDTO, ProjectDTO } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  projects: ProjectDTO[];
  categories: CategoryDTO[];
};

/** Portfolio grid with animated category filtering. */
export default function PortfolioGrid({ projects, categories }: Props) {
  const [active, setActive] = useState<string>("all");

  const filtered = useMemo(
    () => (active === "all" ? projects : projects.filter((p) => p.category?.slug === active)),
    [projects, active]
  );

  return (
    <div>
      {/* Filter bar */}
      <div className="sticky top-[72px] z-30 -mx-5 mb-12 bg-ink/85 px-5 py-4 backdrop-blur-xl sm:-mx-8 sm:px-8" role="tablist" aria-label="Filter projects by category">
        <div className="flex flex-wrap items-center gap-2.5">
          <FilterPill label="All Work" count={projects.length} active={active === "all"} onClick={() => setActive("all")} />
          {categories.map((cat) => (
            <FilterPill
              key={cat.id}
              label={cat.name}
              count={cat.projectCount ?? 0}
              active={active === cat.slug}
              onClick={() => setActive(cat.slug)}
            />
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((project) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <ProjectCard project={project} className="h-full" />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="glass flex flex-col items-center rounded-2xl py-20 text-center">
          <FolderOpen size={40} className="text-zinc-600" />
          <p className="mt-4 font-display text-2xl tracking-wide text-zinc-300">NO PROJECTS YET</p>
          <p className="mt-2 max-w-sm text-sm text-zinc-500">
            Nothing in this category for now — new edits are always in the timeline.
          </p>
        </div>
      )}
    </div>
  );
}

function FilterPill({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "relative rounded-full px-5 py-2.5 text-sm font-medium transition-colors duration-300",
        active ? "text-white" : "text-zinc-400 hover:text-white"
      )}
    >
      {active && (
        <motion.span
          layoutId="filter-pill"
          className="absolute inset-0 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 shadow-glow"
          transition={{ type: "spring", stiffness: 320, damping: 30 }}
        />
      )}
      {!active && <span className="absolute inset-0 rounded-full border border-white/10 bg-white/[0.03]" />}
      <span className="relative z-10">
        {label}
        <span className={cn("ml-2 text-xs", active ? "text-white/80" : "text-zinc-600")}>{count}</span>
      </span>
    </button>
  );
}
