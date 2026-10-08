export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ink">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 rounded-full border-2 border-white/10" />
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-brand-500" />
        <div className="absolute inset-0 flex items-center justify-center font-display text-xl text-brand-500">
          MWM
        </div>
      </div>
      <p className="mt-6 text-xs uppercase tracking-[0.4em] text-zinc-500">Loading</p>
      <div className="mt-3 h-px w-40 overflow-hidden bg-white/10">
        <div className="h-full w-1/3 animate-[marquee_1.2s_linear_infinite] bg-gradient-to-r from-transparent via-brand-500 to-transparent" />
      </div>
    </div>
  );
}
