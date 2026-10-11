import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { getPublishedPosts } from "@/lib/data";
import { asset } from "@/lib/utils";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import CTABand from "@/components/home/CTABand";
import { getSiteContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog",
  description: "Editing breakdowns, behind-the-scenes and tips from Muhanad Wael Mahdy's timeline.",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default async function BlogPage() {
  const [posts, content] = await Promise.all([getPublishedPosts(), getSiteContent()]);

  return (
    <>
      <section className="relative overflow-hidden pb-10 pt-40">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/3 h-[420px] w-[720px] rounded-full bg-brand-900/30 blur-[150px]"
        />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHeading
            kicker="Blog"
            title={
              <>
                FROM THE <span className="text-gradient">TIMELINE</span>
              </>
            }
            description="Editing breakdowns, behind-the-scenes stories and practical tips — straight from real projects."
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8 lg:pb-32">
        {posts.length === 0 ? (
          <p className="rounded-2xl border border-white/8 bg-white/[0.02] px-5 py-16 text-center text-sm text-zinc-500">
            First post is in the works — check back soon.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, i) => (
              <Reveal key={post.id} delay={0.05 * i} className="h-full">
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/8 bg-ink-800 shadow-card transition-all duration-500 hover:-translate-y-1.5 hover:border-brand-500/50 hover:shadow-glow"
                >
                  <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-ink-900 to-brand-950">
                    {post.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={asset(post.coverImage)}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : null}
                    <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[11px] text-zinc-200 backdrop-blur-sm">
                      <Clock size={11} className="text-brand-400" /> {post.readMinutes} min
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <p className="text-xs text-zinc-600">{formatDate(post.publishedAt)}</p>
                    <h2 className="mt-2 font-display text-xl tracking-wide text-white transition-colors group-hover:text-brand-400">
                      {post.title}
                    </h2>
                    {post.excerpt && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-zinc-500">{post.excerpt}</p>}
                    <span className="mt-auto inline-flex items-center gap-2 pt-4 text-xs font-semibold uppercase tracking-[0.2em] text-brand-400">
                      Read breakdown
                      <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      <CTABand heading={content["cta.heading"]} subtext={content["cta.subtext"]} />
    </>
  );
}
