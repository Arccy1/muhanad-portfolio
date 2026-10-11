import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import { getPostBySlug, getPublishedPosts } from "@/lib/data";
import { asset } from "@/lib/utils";
import Reveal from "@/components/ui/Reveal";
import CTABand from "@/components/home/CTABand";
import { getSiteContent } from "@/lib/content";

export const dynamic = "force-dynamic";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  if (!post) return { title: "Post not found" };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.coverImage ? [{ url: asset(post.coverImage) }] : undefined,
      type: "article",
    },
  };
}

function renderContent(content: string) {
  // Lightweight rendering: blank line = paragraph, "## " lines = headings.
  return content.split(/\n\s*\n/).map((block, i) => {
    const trimmed = block.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith("## ")) {
      return (
        <h2 key={i} className="heading-display mt-10 text-2xl text-white sm:text-3xl">
          {trimmed.slice(3)}
        </h2>
      );
    }
    return (
      <p key={i} className="mt-5 leading-relaxed text-zinc-300">
        {trimmed}
      </p>
    );
  });
}

export default async function BlogPostPage({ params }: Props) {
  const post = await getPostBySlug(params.slug);
  if (!post) notFound();

  const content = await getSiteContent();
  const others = (await getPublishedPosts()).filter((p) => p.id !== post.id).slice(0, 2);

  return (
    <article className="relative overflow-hidden pb-20 pt-32 lg:pt-40">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-brand-900/30 blur-[150px]"
      />

      <div className="relative mx-auto max-w-3xl px-5 sm:px-8">
        <Reveal>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-brand-400"
          >
            <ArrowLeft size={16} /> Back to Blog
          </Link>
          <p className="mt-8 flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.25em] text-brand-400">
            {new Date(post.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            <span className="inline-flex items-center gap-1.5 text-zinc-500">
              <Clock size={12} /> {post.readMinutes} min read
            </span>
          </p>
          <h1 className="heading-display mt-4 text-4xl text-white sm:text-5xl">{post.title}</h1>
          {post.excerpt && <p className="mt-5 text-lg leading-relaxed text-zinc-400">{post.excerpt}</p>}
        </Reveal>

        {post.coverImage && (
          <Reveal delay={0.1} className="mt-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={asset(post.coverImage)}
              alt=""
              className="aspect-video w-full rounded-2xl border border-white/10 object-cover shadow-card"
            />
          </Reveal>
        )}

        <Reveal delay={0.15}>
          <div className="mt-10 text-base">{renderContent(post.content)}</div>
        </Reveal>

        {others.length > 0 && (
          <div className="mt-16">
            <h2 className="heading-display text-2xl text-white">
              MORE FROM THE <span className="text-gradient">TIMELINE</span>
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {others.map((p) => (
                <Link
                  key={p.id}
                  href={`/blog/${p.slug}`}
                  className="glass group rounded-2xl p-5 transition hover:border-brand-500/50"
                >
                  <p className="text-xs text-zinc-600">
                    {new Date(p.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                  <p className="mt-1.5 font-display text-lg tracking-wide text-white transition group-hover:text-brand-400">
                    {p.title}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-16">
        <CTABand heading={content["cta.heading"]} subtext={content["cta.subtext"]} />
      </div>
    </article>
  );
}
