"use client";

import Link from "next/link";
import { ListingsClient } from "@/ui/donations/ListingsClient";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { AuthStatus } from "@/ui/auth/AuthStatus";

export default function ListingsPage() {
  const donations = useQuery(api.donations.list) ?? [];

  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="eco-backdrop pointer-events-none absolute inset-0 opacity-95" />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--eco-sand)] bg-[var(--eco-mist)] text-sm font-semibold text-[var(--eco-forest)]">
            EC
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-sm uppercase tracking-[0.2em] text-[var(--eco-moss)]">
              EcoChain
            </span>
            <span className="text-xs text-[var(--eco-forest)]/70">
              Listings
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Link
            href="/"
            className="rounded-full border border-[var(--eco-forest)]/20 px-4 py-2 text-[var(--eco-forest)] transition hover:bg-[var(--eco-mist)]"
          >
            Back to home
          </Link>
          <Link
            href="/map"
            className="rounded-full border border-[var(--eco-forest)]/20 px-4 py-2 text-xs font-semibold text-[var(--eco-forest)] transition hover:bg-[var(--eco-mist)]"
          >
            Map
          </Link>
          <Link
            href="/notifications"
            className="rounded-full border border-[var(--eco-forest)]/20 px-4 py-2 text-xs font-semibold text-[var(--eco-forest)] transition hover:bg-[var(--eco-mist)]"
          >
            Notifications
          </Link>
          <Link
            href="/listings/new"
            className="rounded-full bg-[var(--eco-moss)] px-4 py-2 font-semibold text-[var(--eco-base)] shadow-sm transition hover:translate-y-[-1px]"
          >
            New listing
          </Link>
          <AuthStatus />
        </div>
      </header>

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
              Use these curated listings to coordinate pickups, deliveries, and
              verification schedules. This view is now powered by Convex and
              will sync on-chain proofs later.
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

        <section className="rounded-[28px] border border-[var(--eco-sand)] bg-white/70 p-6 shadow-sm">
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
        </section>
      </main>
    </div>
  );
}
