import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-ink px-6 text-center">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-600/10 blur-[140px]" />
      </div>
      <p className="section-kicker">Error 404</p>
      <h1 className="heading-display mt-4 text-7xl text-white md:text-9xl">
        SCENE <span className="text-gradient">NOT FOUND</span>
      </h1>
      <p className="mt-6 max-w-md text-zinc-400">
        This edit doesn&apos;t exist — it may have been cut from the final timeline.
      </p>
      <Link
        href="/"
        className="mt-10 inline-flex items-center gap-2 rounded-full bg-brand-600 px-8 py-3.5 font-semibold text-onbrand shadow-glow transition hover:bg-brand-500 hover:shadow-glow-lg"
      >
        Back to Home
      </Link>
    </main>
  );
}
