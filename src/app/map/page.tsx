import { DonationsMap } from "@/ui/map/DonationsMap";
import { MainNav } from "@/ui/navigation/MainNav";

export default function MapPage() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="eco-backdrop pointer-events-none absolute inset-0 opacity-95" />

      <MainNav variant="app" subtitle="Map" />

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 pb-16">
        <section className="grid gap-2">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--eco-forest)]/60">
            Community map
          </p>
          <h1 className="font-[var(--font-display)] text-3xl text-[var(--eco-forest)]">
            Live donation nodes
          </h1>
        </section>
        <section className="grid gap-4 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div>
            <p className="text-sm text-[var(--eco-forest)]/70">
              Each marker represents a listing with a saved coordinate. Add
              latitude and longitude when creating listings to display them
              here. No routing needed for the demo.
            </p>
          </div>
        </section>

        <DonationsMap />
      </main>
    </div>
  );
}
