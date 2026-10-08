import Link from "next/link";
import { Clock, Play } from "lucide-react";
import type { ProjectDTO } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  project: ProjectDTO;
  className?: string;
};

export default function ProjectCard({ project, className }: Props) {
  return (
    <Link
      href={`/portfolio/${project.slug}`}
      className={cn(
        "group relative block overflow-hidden rounded-2xl border border-white/8 bg-ink-800 shadow-card transition-all duration-500 hover:-translate-y-1.5 hover:border-brand-500/50 hover:shadow-glow",
        className
      )}
      aria-label={`Open project: ${project.title}`}
    >
      <div className="relative aspect-video overflow-hidden">
        {project.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.thumbnailUrl}
            alt={project.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-ink-900 to-brand-950" />
        )}

        {/* hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-95" />

        {/* play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={cn(
              "flex h-16 w-16 scale-75 items-center justify-center rounded-full border border-white/30 bg-black/40 opacity-0 backdrop-blur-sm transition-all duration-500 group-hover:scale-100 group-hover:opacity-100",
              "shadow-glow"
            )}
          >
            <Play size={22} className="ml-1 fill-brand-500 text-brand-500" />
          </span>
        </div>

        {/* category chip */}
        {project.category && (
          <span className="absolute left-4 top-4 rounded-full border border-brand-500/40 bg-black/50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-400 backdrop-blur-sm">
            {project.category.name}
          </span>
        )}
        {project.duration && (
          <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1 text-[11px] font-medium text-zinc-200 backdrop-blur-sm">
            <Clock size={12} className="text-brand-400" />
            {project.duration}
          </span>
        )}
      </div>

      <div className="relative p-5">
        <h3 className="font-display text-xl tracking-wide text-white transition-colors group-hover:text-brand-400">
          {project.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-zinc-500">
          {project.shortDescription}
        </p>
        {project.software.length > 0 && (
          <div className="mt-3.5 flex flex-wrap gap-1.5">
            {project.software.slice(0, 3).map((sw) => (
              <span
                key={sw}
                className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] uppercase tracking-wider text-zinc-500"
              >
                {sw}
              </span>
            ))}
            {project.software.length > 3 && (
              <span className="rounded-md px-1 py-0.5 text-[10px] text-zinc-600">
                +{project.software.length - 3}
              </span>
            )}
          </div>
        )}
        <span
          aria-hidden
          className="absolute bottom-0 left-5 right-5 h-px origin-left scale-x-0 bg-gradient-to-r from-brand-500 to-transparent transition-transform duration-500 group-hover:scale-x-100"
        />
      </div>
    </Link>
  );
}
