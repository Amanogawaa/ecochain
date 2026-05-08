import Link from "next/link";
import { DonationsMap } from "@/ui/map/DonationsMap";

export default function MapPage() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="eco-backdrop pointer-events-none absolute inset-0 opacity-95" />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--eco-forest)]/60">
            Community map
          </p>
          <h1 className="mt-2 font-[var(--font-display)] text-3xl text-[var(--eco-forest)]">
            Live donation nodes
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="rounded-full border border-[var(--eco-forest)]/20 px-4 py-2 text-xs font-semibold text-[var(--eco-forest)] transition hover:bg-[var(--eco-mist)]"
          >
            Back to home
          </Link>
          <Link
            href="/listings"
            className="rounded-full border border-[var(--eco-forest)]/20 px-4 py-2 text-xs font-semibold text-[var(--eco-forest)] transition hover:bg-[var(--eco-mist)]"
          >
            View listings
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 pb-16">
        <section className="grid gap-4 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div>
            <p className="text-sm text-[var(--eco-forest)]/70">
              Each marker represents a listing with a saved coordinate. Add
              latitude and longitude when creating listings to display them
              here. No routing needed for the demo.
            </p>
          </div>
          <div className="rounded-[28px] border border-[var(--eco-sand)] bg-white/70 p-5 text-xs text-[var(--eco-forest)]/70">
            <p className="font-semibold text-[var(--eco-forest)]">Map tip</p>
            <p className="mt-2">
              Use this view in the demo to show real-time community visibility.
            </p>
          </div>
        </section>

        <DonationsMap />
      </main>
    </div>
  );
}
