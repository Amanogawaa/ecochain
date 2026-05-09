import Link from "next/link";
import { ListingDetailClient } from "@/ui/donations/ListingDetailClient";
import type { Id } from "../../../../convex/_generated/dataModel";
import { MainNav } from "@/ui/navigation/MainNav";

type ListingDetailProps = {
  params: Promise<{ id: string }>;
};

export default async function ListingDetailPage({
  params,
}: ListingDetailProps) {
  const { id } = await params;
  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="eco-backdrop pointer-events-none absolute inset-0 opacity-95" />

      <MainNav variant="app" subtitle="Listing detail" />

      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 pb-16">
        <section className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--eco-forest)]/60">
              Listing detail
            </p>
            <h1 className="mt-2 font-[var(--font-display)] text-3xl text-[var(--eco-forest)]">
              Listing overview
            </h1>
          </div>
          <Link
            href="/listings"
            className="rounded-full border border-[var(--eco-forest)]/20 px-4 py-2 text-sm text-[var(--eco-forest)] transition hover:bg-[var(--eco-mist)]"
          >
            Back to listings
          </Link>
        </section>
        <ListingDetailClient id={id as Id<"donations">} />
      </main>
    </div>
  );
}
