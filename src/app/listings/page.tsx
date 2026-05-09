"use client";

import { ListingsClient } from "@/ui/donations/ListingsClient";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { MainNav } from "@/ui/navigation/MainNav";

export default function ListingsPage() {
  const donations = useQuery(api.donations.list) ?? [];

  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="eco-backdrop pointer-events-none absolute inset-0 opacity-95" />

      <MainNav variant="app" subtitle="Listings" />

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-6 pb-16">
        <section className="grid gap-6 md:grid-cols-[1.1fr_0.9fr] md:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[var(--eco-forest)]/60">
              live exchange
            </p>
            <h1 className="mt-3 font-[var(--font-display)] text-3xl text-[var(--eco-forest)] sm:text-4xl">
              See what your community can share today.
            </h1>
            <p className="mt-3 max-w-xl text-sm text-[var(--eco-forest)]/70">
              Explore nearby listings, claim what you can use, and coordinate
              handoffs with owners and verifiers.
            </p>
          </div>
          <div className="rounded-3xl border border-[var(--eco-sand)] bg-[var(--eco-base)]/80 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--eco-forest)]/60">
              active today
            </p>
            <div className="mt-3 flex items-end justify-between">
              <div>
                <p className="text-3xl font-semibold text-[var(--eco-forest)]">
                  {donations.length}
                </p>
                <p className="text-xs text-[var(--eco-forest)]/60">
                  listings in motion
                </p>
              </div>
              <div className="rounded-2xl bg-[var(--eco-mist)] px-4 py-2 text-xs text-[var(--eco-forest)]">
                4 hubs online
              </div>
            </div>
          </div>
        </section>

        <ListingsClient donations={donations} />

        {/* <section className="rounded-[28px] border border-[var(--eco-sand)] bg-white/70 p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr] md:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[var(--eco-forest)]/60">
                coordinator notes
              </p>
              <h2 className="mt-2 font-[var(--font-display)] text-2xl text-[var(--eco-forest)]">
                Keep listings lightweight before blockchain deployment.
              </h2>
              <p className="mt-2 text-sm text-[var(--eco-forest)]/70">
                The goal is to show the community flow first. Once you are ready
                to connect Avalanche, verified handoffs can be written as a
                proof hash per listing.
              </p>
            </div>
            <div className="rounded-2xl bg-[var(--eco-mist)] p-5 text-xs text-[var(--eco-forest)]/70">
              <p className="font-semibold text-[var(--eco-forest)]">
                Demo reminder
              </p>
              <p className="mt-2">
                Highlight the listing workflow, then show how the verification
                button will later trigger the on-chain log.
              </p>
            </div>
          </div>
        </section> */}
      </main>
    </div>
  );
}
