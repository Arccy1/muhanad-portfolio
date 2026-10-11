"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { FileText, Globe, Menu, Moon, Sun, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang } from "@/components/site/LanguageProvider";
import { LANGS } from "@/lib/i18n";

const LINKS = [
  { href: "/", key: "nav.home" },
  { href: "/portfolio", key: "nav.portfolio" },
  { href: "/about", key: "nav.about" },
  { href: "/services", key: "nav.services" },
  { href: "/showreel", key: "nav.showreel" },
  { href: "/blog", key: "nav.blog" },
  { href: "/contact", key: "nav.contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLight, setIsLight] = useState(false);
  const pathname = usePathname();
  const { t, lang, setLang } = useLang();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    setMounted(true);
    setIsLight(document.documentElement.classList.contains("light"));
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function toggleTheme() {
    const next = !isLight;
    document.documentElement.classList.toggle("light", next);
    try {
      localStorage.setItem("mwm-theme", next ? "light" : "dark");
    } catch {
      /* private mode — theme just won't persist */
    }
    setIsLight(next);
  }

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
        <Link href="/" className="group flex items-center gap-3" aria-label="Muhanad Wael El-Mahdy — home">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-brand-500/50 bg-brand-600/10 font-display text-xl text-brand-500 shadow-glow-sm transition group-hover:bg-brand-600 group-hover:text-white">
            M
          </span>
          <span className="leading-tight">
            <span className="block font-display text-lg tracking-wider text-white">MUHANAD EL-MAHDY</span>
            <span className="block text-[10px] uppercase tracking-[0.3em] text-brand-400">{t("nav.subtitle")}</span>
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
                <span className="relative z-10">{t(link.key)}</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-zinc-400 transition hover:border-brand-500/50 hover:text-brand-400"
            aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
            title={isLight ? "Dark mode" : "Light mode"}
          >
            {mounted && isLight ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button
            type="button"
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-white/10 px-2.5 text-xs font-semibold text-zinc-400 transition hover:border-brand-500/50 hover:text-brand-400"
            aria-label={lang === "ar" ? "Switch to English" : "التبديل إلى العربية"}
            title={lang === "ar" ? "English" : "العربية"}
          >
            <Globe size={15} />
            {mounted && lang === "ar" ? "EN" : "عربي"}
          </button>
          <Link
            href="/cv"
            className="hidden items-center gap-2 rounded-full border border-white/10 px-5 py-2.5 text-sm font-semibold text-zinc-300 transition hover:border-brand-500/60 hover:text-brand-400 md:inline-flex"
          >
            <FileText size={15} />
            CV
          </Link>
          <Link
            href="/contact"
            className="hidden rounded-full bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-2.5 text-sm font-semibold text-onbrand shadow-glow transition hover:shadow-glow-lg hover:brightness-110 sm:inline-flex"
          >
            {t("nav.hire")}
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
                    {t(link.key)}
                    <span className="text-xs text-brand-500">0{i + 1}</span>
                  </Link>
                </motion.li>
              ))}
              <motion.li
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * LINKS.length }}
              >
                <Link
                  href="/cv"
                  className="flex items-center justify-between rounded-xl px-4 py-3 text-base font-medium text-zinc-400 hover:bg-white/5 hover:text-white"
                >
                  <span className="inline-flex items-center gap-2">
                    <FileText size={16} /> {t("nav.cv")}
                  </span>
                  <span className="text-xs text-brand-500">OPEN</span>
                </Link>
              </motion.li>
              <li className="pt-3">
                <Link
                  href="/contact"
                  className="flex items-center justify-center rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-3 font-semibold text-onbrand shadow-glow"
                >
                  {t("nav.hire")}
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
