import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getRatingByToken } from "@/lib/data";
import RateForm from "@/components/rate/RateForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Rate your project",
  robots: { index: false },
};

type Props = { params: { token: string } };

export default async function RatePage({ params }: Props) {
  const rating = await getRatingByToken(params.token);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-5 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 h-[420px] w-[680px] -translate-x-1/2 rounded-full bg-brand-600/15 blur-[150px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 h-[300px] w-[300px] rounded-full bg-brand-900/30 blur-[120px]"
      />

      <div className="relative w-full max-w-xl">
        {!rating ? (
          <div className="glass rounded-3xl p-10 text-center">
            <h1 className="font-display text-3xl tracking-wide text-white">LINK NOT VALID</h1>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              This review link doesn&apos;t exist or was removed. Please ask Muhanad for a
              fresh link.
            </p>
            <Link
              href="/"
              className="mt-8 inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-brand-400"
            >
              <ArrowLeft size={15} /> Go to the website
            </Link>
          </div>
        ) : rating.rating > 0 ? (
          <div className="glass rounded-3xl p-10 text-center">
            <h1 className="font-display text-3xl tracking-wide text-white">THANK YOU!</h1>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              You already submitted a review for this project
              {rating.projectName ? ` (${rating.projectName})` : ""}. It means a lot!
            </p>
            <Link
              href="/"
              className="mt-8 inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-brand-400"
            >
              <ArrowLeft size={15} /> Go to the website
            </Link>
          </div>
        ) : (
          <RateForm
            token={rating.token}
            projectName={rating.projectName}
          />
        )}
      </div>
    </main>
  );
}
