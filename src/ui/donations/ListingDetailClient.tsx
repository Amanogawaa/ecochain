"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import type { DonationStatus } from "@/domains/donations/Donation";
import type { Id } from "../../../convex/_generated/dataModel";

const statusCopy: Record<DonationStatus, string> = {
  ready: "Ready for pickup",
  assigned: "Verifier assigned",
  transport: "Requesting transport",
  scheduled: "Pickup scheduled",
};

type ListingDetailClientProps = {
  id?: Id<"donations">;
};

export function ListingDetailClient({ id }: ListingDetailClientProps) {
  const donation = useQuery(api.donations.getById, id ? { id } : "skip");

  if (donation === undefined) {
    return (
      <div className="rounded-[32px] border border-[var(--eco-sand)] bg-white/80 p-6 text-sm text-[var(--eco-forest)]/70">
        Loading listing details...
      </div>
    );
  }

  if (!donation) {
    return (
      <div className="rounded-[32px] border border-[var(--eco-sand)] bg-white/80 p-6 text-sm text-[var(--eco-forest)]/70">
        This listing could not be found.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="grid gap-4 rounded-[32px] border border-[var(--eco-sand)] bg-white/80 p-6 shadow-sm md:grid-cols-[1.2fr_0.8fr]">
        <div className="grid gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--eco-forest)]/60">
              Location
            </p>
            <p className="mt-2 text-sm text-[var(--eco-forest)]">
              {donation.location}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--eco-forest)]/60">
              Status
            </p>
            <p className="mt-2 text-sm text-[var(--eco-forest)]">
              {statusCopy[donation.status as DonationStatus]}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--eco-forest)]/60">
              Coordinator
            </p>
            <p className="mt-2 text-sm text-[var(--eco-forest)]">
              {donation.coordinator}
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--eco-sand)] bg-[var(--eco-mist)] p-5 text-xs text-[var(--eco-forest)]/70">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--eco-forest)]/60">
            Activity
          </p>
          <p className="mt-3 text-base font-semibold text-[var(--eco-forest)]">
            {donation.updatedAt}
          </p>
          <p className="mt-2">
            Keep this detail view handy for your demo. This is where the
            verification button can later trigger the Avalanche transaction.
          </p>
          <button className="mt-4 w-full rounded-full border border-[var(--eco-forest)]/20 bg-white/70 px-4 py-2 text-xs font-semibold text-[var(--eco-forest)] transition hover:translate-y-[-1px]">
            Verify handoff
          </button>
        </div>
      </section>

      <section className="grid gap-4 rounded-[32px] border border-[var(--eco-sand)] bg-white/80 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--eco-forest)]/60">
              Category
            </p>
            <p className="mt-2 text-sm text-[var(--eco-forest)]">
              {donation.category}
            </p>
          </div>
          <span className="rounded-full bg-[var(--eco-mist)] px-3 py-1 text-xs text-[var(--eco-forest)]">
            Listing id: {donation._id}
          </span>
        </div>
        <p className="text-sm text-[var(--eco-forest)]/70">
          Add item description, pickup windows, or a QR code here once you
          connect to your backend or on-chain verifier.
        </p>
        <Link
          href="/listings"
          className="text-xs font-semibold text-[var(--eco-moss)]"
        >
          Back to listings →
        </Link>
      </section>
    </div>
  );
}
