import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost";
  className?: string;
  external?: boolean;
};

/** Brand CTA button — glowing red fill or outlined ghost style. */
export default function GlowButton({ href, children, variant = "primary", className, external }: Props) {
  const base = cn(
    "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-8 py-3.5 text-sm font-semibold uppercase tracking-widest transition-all duration-300 focus-visible:ring-2",
    variant === "primary"
      ? "bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-glow hover:shadow-glow-lg hover:brightness-110"
      : "glass text-white hover:border-brand-500/60 hover:text-brand-400 hover:shadow-glow-sm",
    className
  );

  const inner = (
    <>
      {variant === "primary" && (
        <span
          aria-hidden
          className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full"
        />
      )}
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={base}>
        {inner}
      </a>
    );
  }

  return (
    <Link href={href} className={base}>
      {inner}
    </Link>
  );
}
