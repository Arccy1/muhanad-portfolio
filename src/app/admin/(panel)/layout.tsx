"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Clapperboard,
  FileText,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  MessageSquareQuote,
  Moon,
  Settings2,
  Newspaper,
  Star,
  Sun,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/projects", label: "Projects", icon: Clapperboard },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote },
  { href: "/admin/reviews", label: "Client Reviews", icon: Star },
  { href: "/admin/blog", label: "Blog", icon: Newspaper },
  { href: "/admin/cv", label: "CV", icon: FileText },
  { href: "/admin/messages", label: "Messages", icon: Mail },
  { href: "/admin/content", label: "Site Content", icon: Settings2 },
];

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [checked, setChecked] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLight, setIsLight] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    setIsLight(document.documentElement.classList.contains("light"));
  }, []);

  function toggleTheme() {
    const next = !isLight;
    document.documentElement.classList.toggle("light", next);
    try {
      localStorage.setItem("mwm-theme", next ? "light" : "dark");
    } catch {
      /* private mode */
    }
    setIsLight(next);
  }

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("unauthorized"))))
      .then((data) => {
        if (!cancelled) {
          setUser(data.user);
          setChecked(true);
        }
      })
      .catch(() => {
        if (!cancelled) router.replace("/admin/login");
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  if (!checked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink">
        <div className="relative h-14 w-14">
          <div className="absolute inset-0 rounded-full border-2 border-white/10" />
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-brand-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink lg:flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform border-r border-white/5 bg-ink-800 transition-transform duration-300 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <Link href="/admin" className="flex h-[72px] items-center gap-3 border-b border-white/5 px-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-brand-500/50 bg-brand-600/10 font-display text-xl text-brand-500">
              M
            </span>
            <span className="leading-tight">
              <span className="block font-display text-lg tracking-wider text-white">ADMIN PANEL</span>
              <span className="block text-[9px] uppercase tracking-[0.3em] text-brand-400">Muhanad El-Mahdy</span>
            </span>
          </Link>

          <nav className="flex-1 space-y-1 overflow-y-auto p-4" aria-label="Admin navigation">
            {NAV.map((item) => {
              const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
                    active
                      ? "bg-gradient-to-r from-brand-600/20 to-transparent text-white shadow-[inset_2px_0_0_0_#3B82F6]"
                      : "text-zinc-500 hover:bg-white/[0.03] hover:text-white"
                  )}
                >
                  <item.icon size={18} className={active ? "text-brand-400" : ""} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-white/5 p-4">
            <button
              type="button"
              onClick={toggleTheme}
              className="mb-2 flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-medium text-zinc-500 transition hover:text-brand-400"
            >
              {mounted && isLight ? <Moon size={15} /> : <Sun size={15} />}
              {mounted && isLight ? "Dark mode" : "Light mode"}
            </button>
            <Link
              href="/"
              target="_blank"
              className="mb-2 block rounded-xl px-4 py-2.5 text-xs font-medium text-zinc-500 transition hover:text-brand-400"
            >
              ↗ View live website
            </Link>
            <div className="flex items-center justify-between gap-2 rounded-xl bg-white/[0.03] px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">{user?.name}</p>
                <p className="truncate text-xs text-zinc-600">{user?.email}</p>
              </div>
              <button
                type="button"
                onClick={logout}
                aria-label="Log out"
                title="Log out"
                className="shrink-0 rounded-lg p-2 text-zinc-500 transition hover:bg-brand-600/10 hover:text-brand-400"
              >
                <LogOut size={17} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile topbar */}
      <div className="sticky top-0 z-30 flex h-[64px] items-center justify-between border-b border-white/5 bg-ink/90 px-5 backdrop-blur-xl lg:hidden">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-white"
          aria-label="Open admin menu"
        >
          <Menu size={20} />
        </button>
        <span className="font-display text-lg tracking-wider text-white">ADMIN</span>
        <button
          type="button"
          onClick={logout}
          className="rounded-lg p-2 text-zinc-400 hover:text-brand-400"
          aria-label="Log out"
        >
          <LogOut size={18} />
        </button>
      </div>

      {/* Main */}
      <main className="flex-1 px-5 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>

      {/* mobile backdrop */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
