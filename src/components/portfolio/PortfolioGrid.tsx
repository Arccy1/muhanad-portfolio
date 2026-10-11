"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, FolderOpen, Search, X } from "lucide-react";
import ProjectCard from "./ProjectCard";
import type { CategoryDTO, ProjectDTO } from "@/lib/types";
import { cn } from "@/lib/utils";

const PER_PAGE = 9;

type Props = {
  projects: ProjectDTO[];
  categories: CategoryDTO[];
};

/** Portfolio grid with search, animated category filtering and pagination. */
export default function PortfolioGrid({ projects, categories }: Props) {
  const [active, setActive] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((p) => {
      if (active !== "all" && p.category?.slug !== active) return false;
      if (q) {
        const hay = `${p.title} ${p.client} ${p.shortDescription} ${(p.tags || []).join(" ")} ${(p.software || []).join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [projects, active, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, pageCount);
  const visible = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  // reset to page 1 whenever the filters/search change
  useEffect(() => {
    setPage(1);
  }, [active, query]);

  return (
    <div>
      {/* Search + filter bar */}
      <div className="sticky top-[72px] z-30 -mx-5 mb-12 bg-ink/85 px-5 py-4 backdrop-blur-xl sm:-mx-8 sm:px-8" role="tablist" aria-label="Filter projects by category">
        <div className="mb-3 flex items-center gap-3">
          <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
            <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects…"
              aria-label="Search projects"
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 pl-10 pr-9 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-brand-500/60"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 transition hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
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
      {visible.length > 0 ? (
        <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {visible.map((project) => (
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
          <p className="mt-4 font-display text-2xl tracking-wide text-zinc-300">NO PROJECTS FOUND</p>
          <p className="mt-2 max-w-sm text-sm text-zinc-500">
            {projects.length > 0
              ? "Try a different search or category."
              : "Nothing in this category for now — new edits are always in the timeline."}
          </p>
        </div>
      )}

      {/* Pagination */}
      {pageCount > 1 && (
        <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Portfolio pages">
          <button
            type="button"
            onClick={() => setPage(safePage - 1)}
            disabled={safePage === 1}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-zinc-400 transition hover:border-brand-500/60 hover:text-brand-400 disabled:opacity-30"
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setPage(n)}
              aria-current={safePage === n ? "page" : undefined}
              className={cn(
                "h-10 w-10 rounded-lg border text-sm font-medium transition",
                safePage === n
                  ? "border-brand-500 bg-brand-600/20 text-white"
                  : "border-white/10 text-zinc-400 hover:border-brand-500/40 hover:text-white"
              )}
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPage(safePage + 1)}
            disabled={safePage === pageCount}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-zinc-400 transition hover:border-brand-500/60 hover:text-brand-400 disabled:opacity-30"
            aria-label="Next page"
          >
            <ChevronRight size={16} />
          </button>
        </nav>
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
        active ? "text-onbrand" : "text-zinc-400 hover:text-white"
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
        <span className={cn("ml-2 text-xs", active ? "text-onbrand/80" : "text-zinc-600")}>{count}</span>
      </span>
    </button>
  );
}
