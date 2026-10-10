"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Calendar,
  ChevronDown,
  Filter,
  FolderTree,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import ProjectForm, { emptyProject, projectToForm, type ProjectFormValues } from "@/components/admin/ProjectForm";
import type { CategoryDTO, ProjectDTO } from "@/lib/types";
import { cn } from "@/lib/utils";

type StatusFilter = "all" | "published" | "draft";

function FilterSelect({
  icon: Icon,
  label,
  value,
  onChange,
  children,
}: {
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="relative inline-block">
      <span className="sr-only">{label}</span>
      <Icon size={15} className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-zinc-600" />
      <select
        value={value}
        onChange={onChange}
        className="appearance-none rounded-xl border border-white/10 bg-white/[0.03] py-2.5 pl-10 pr-9 text-sm text-white outline-none transition focus:border-brand-500/60"
      >
        {children}
      </select>
      <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600" />
    </label>
  );
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ProjectDTO | "new" | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Filters
  const [fCategory, setFCategory] = useState("all");
  const [fYear, setFYear] = useState("all");
  const [fStatus, setFStatus] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const [pRes, cRes] = await Promise.all([fetch("/api/projects?all=1"), fetch("/api/categories")]);
    const pData = await pRes.json();
    const cData = await cRes.json();
    setProjects(pData.projects ?? []);
    setCategories(cData.categories ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const years = useMemo(() => {
    const set = new Set(projects.map((p) => p.year).filter(Boolean));
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [projects]);

  const publishedCount = useMemo(() => projects.filter((p) => p.published).length, [projects]);
  const draftCount = projects.length - publishedCount;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return projects.filter((p) => {
      if (fCategory !== "all" && p.category?.id !== fCategory) return false;
      if (fYear !== "all" && p.year !== fYear) return false;
      if (fStatus === "published" && !p.published) return false;
      if (fStatus === "draft" && p.published) return false;
      if (q) {
        const haystack = `${p.title} ${p.client} ${p.slug} ${p.category?.name ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [projects, fCategory, fYear, fStatus, search]);

  const activeFilterCount =
    (fCategory !== "all" ? 1 : 0) +
    (fYear !== "all" ? 1 : 0) +
    (fStatus !== "all" ? 1 : 0) +
    (search.trim() ? 1 : 0);

  const clearFilters = () => {
    setFCategory("all");
    setFYear("all");
    setFStatus("all");
    setSearch("");
  };

  async function save(values: ProjectFormValues) {
    setSaving(true);
    setError("");
    const payload = {
      ...values,
      software: values.software,
      gallery: values.gallery,
      beforeAfter: values.beforeAfter,
      process: values.process,
      tags: values.tags,
      categoryId: values.categoryId || null,
    };
    try {
      const res =
        editing === "new"
          ? await fetch("/api/projects", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            })
          : await fetch(`/api/projects/${editing!.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Save failed.");
        return;
      }
      setEditing(null);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function remove(project: ProjectDTO) {
    if (!window.confirm(`Delete "${project.title}"? This cannot be undone.`)) return;
    await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
    await load();
  }

  if (loading) {
    return <p className="py-20 text-center text-sm text-zinc-500">Loading projects…</p>;
  }

  if (editing) {
    return (
      <div>
        <div className="mb-8 flex items-center justify-between">
          <h1 className="font-display text-3xl tracking-wide text-white">
            {editing === "new" ? "ADD PROJECT" : "EDIT PROJECT"}
          </h1>
        </div>
        <ProjectForm
          categories={categories}
          initial={editing === "new" ? emptyProject() : projectToForm(editing)}
          saving={saving}
          error={error}
          onSave={save}
          onCancel={() => {
            setEditing(null);
            setError("");
          }}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl tracking-wide text-white">PROJECTS</h1>
          <p className="mt-1 text-sm text-zinc-500">{projects.length} total — manage your portfolio content.</p>
        </div>
        <button
          type="button"
          onClick={() => setEditing("new")}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-2.5 text-sm font-semibold text-onbrand shadow-glow transition hover:shadow-glow-lg"
        >
          <Plus size={16} /> Add Project
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="glass mb-6 rounded-2xl p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="mr-1 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            <Filter size={14} className="text-brand-400" />
            Filter
          </span>

          <div className="relative min-w-[190px] flex-1 sm:max-w-[260px]">
            <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, client, slug…"
              aria-label="Search projects"
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-brand-500/60"
            />
          </div>

          <FilterSelect icon={FolderTree} label="Filter by category" value={fCategory} onChange={(e) => setFCategory(e.target.value)}>
            <option value="all" className="bg-ink-800">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id} className="bg-ink-800">
                {c.name} ({c.projectCount ?? 0})
              </option>
            ))}
          </FilterSelect>

          <FilterSelect icon={Calendar} label="Filter by year" value={fYear} onChange={(e) => setFYear(e.target.value)}>
            <option value="all" className="bg-ink-800">All years</option>
            {years.map((y) => (
              <option key={y} value={y} className="bg-ink-800">{y}</option>
            ))}
          </FilterSelect>

          <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.03] p-1" role="group" aria-label="Filter by status">
            {(
              [
                ["all", `All (${projects.length})`],
                ["published", `Published (${publishedCount})`],
                ["draft", `Draft (${draftCount})`],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFStatus(value)}
                aria-pressed={fStatus === value}
                className={cn(
                  "rounded-lg px-3.5 py-1.5 text-xs font-semibold transition",
                  fStatus === value
                    ? "bg-gradient-to-r from-brand-600 to-brand-500 text-onbrand shadow-glow-sm"
                    : "text-zinc-500 hover:text-white"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3.5 py-2.5 text-xs font-medium text-zinc-400 transition hover:border-brand-500/50 hover:text-brand-400"
            >
              <RotateCcw size={13} /> Reset
            </button>
          )}

          <span className="ml-auto text-xs text-zinc-500">
            Showing <span className="font-semibold text-white">{filtered.length}</span> of {projects.length}
          </span>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/8">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-white/[0.03] text-xs uppercase tracking-[0.2em] text-zinc-500">
            <tr>
              <th className="px-5 py-4 font-semibold">Project</th>
              <th className="px-5 py-4 font-semibold">Category</th>
              <th className="px-5 py-4 font-semibold">Year</th>
              <th className="px-5 py-4 font-semibold">Status</th>
              <th className="px-5 py-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((p) => (
              <tr key={p.id} className="transition hover:bg-white/[0.02]">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.thumbnailUrl || "/images/profile.svg"}
                      alt=""
                      className="h-11 w-20 shrink-0 rounded-md border border-white/10 object-cover"
                    />
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 truncate font-medium text-white">
                        {p.title}
                        {p.featured && <Star size={12} className="shrink-0 fill-brand-500 text-brand-500" />}
                      </p>
                      <p className="truncate text-xs text-zinc-600">/portfolio/{p.slug} · {p.duration}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-zinc-400">{p.category?.name ?? "—"}</td>
                <td className="px-5 py-3.5 text-zinc-400">{p.year || "—"}</td>
                <td className="px-5 py-3.5">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                      p.published ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-500/10 text-zinc-500"
                    )}
                  >
                    <span className={cn("h-1.5 w-1.5 rounded-full", p.published ? "bg-emerald-400" : "bg-zinc-500")} />
                    {p.published ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(p);
                        setError("");
                      }}
                      className="rounded-lg border border-white/10 p-2 text-zinc-400 transition hover:border-brand-500/50 hover:text-brand-400"
                      aria-label={`Edit ${p.title}`}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(p)}
                      className="rounded-lg border border-white/10 p-2 text-zinc-400 transition hover:border-brand-500/60 hover:bg-brand-600/10 hover:text-brand-400"
                      aria-label={`Delete ${p.title}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-16 text-center">
                  {projects.length === 0 ? (
                    <span className="text-zinc-500">No projects yet — add your first one.</span>
                  ) : (
                    <span className="text-zinc-500">
                      No projects match your filters.{" "}
                      <button type="button" onClick={clearFilters} className="text-brand-400 underline-offset-2 hover:underline">
                        Reset filters
                      </button>
                    </span>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
