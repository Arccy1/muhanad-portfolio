"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/showreel", label: "Showreel" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu whenever the route changes.
  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled ? "border-b border-white/5 bg-ink/80 backdrop-blur-xl" : "bg-transparent"
      )}
    >
      <nav className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8" aria-label="Main navigation">
        <Link href="/" className="group flex items-center gap-3" aria-label="Muhanad Wael Mahdy — home">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-brand-500/50 bg-brand-600/10 font-display text-xl text-brand-500 shadow-glow-sm transition group-hover:bg-brand-600 group-hover:text-white">
            M
          </span>
          <span className="leading-tight">
            <span className="block font-display text-lg tracking-wider text-white">MUHANAD MAHDY</span>
            <span className="block text-[10px] uppercase tracking-[0.3em] text-brand-400">Video Editor</span>
          </span>
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "relative rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  isActive(link.href) ? "text-white" : "text-zinc-400 hover:text-white"
                )}
              >
                {isActive(link.href) && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full border border-brand-500/40 bg-brand-600/10"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <Link
            href="/contact"
            className="hidden rounded-full bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:shadow-glow-lg hover:brightness-110 sm:inline-flex"
          >
            Hire Me
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-white lg:hidden"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden border-b border-white/5 bg-ink/95 backdrop-blur-xl lg:hidden"
          >
            <ul className="space-y-1 px-5 pb-6 pt-2">
              {LINKS.map((link, i) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                >
                  <Link
                    href={link.href}
                    className={cn(
                      "flex items-center justify-between rounded-xl px-4 py-3 text-base font-medium",
                      isActive(link.href)
                        ? "border border-brand-500/40 bg-brand-600/10 text-white"
                        : "text-zinc-400 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    {link.label}
                    <span className="text-xs text-brand-500">0{i + 1}</span>
                  </Link>
                </motion.li>
              ))}
              <li className="pt-3">
                <Link
                  href="/contact"
                  className="flex items-center justify-center rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-3 font-semibold text-white shadow-glow"
                >
                  Hire Me
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
