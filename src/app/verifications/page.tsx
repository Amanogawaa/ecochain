"use client";

import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { useConvexAuth } from "@convex-dev/auth/react";
import { api } from "@/../convex/_generated/api";
import { MainNav } from "@/ui/navigation/MainNav";
import { DonationCard } from "@/ui/donations/DonationCard";

export default function VerificationsPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const me = useQuery(api.users.me);
  const listings = useQuery(api.donations.list) ?? [];
  const claims =
    useQuery(
      api.claims.listNeedsReview,
      isAuthenticated && me?.role === "verifier" ? {} : "skip",
    ) ?? [];
  const review = useMutation(api.claims.review);

  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="eco-backdrop pointer-events-none absolute inset-0 opacity-95" />

      <MainNav variant="app" subtitle="Verifications" />

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 pb-16">
        <section className="grid gap-2">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--eco-forest)]/60">
            Dashboard
          </p>
          <h1 className="font-[var(--font-display)] text-3xl text-[var(--eco-forest)]">
            Review handoffs and track all listings
          </h1>
        </section>
        {!isLoading && !isAuthenticated ? (
          <div className="rounded-[32px] border border-[var(--eco-sand)] bg-white/80 p-6 text-sm text-[var(--eco-forest)]/70">
            <p>You need to sign in to review claims.</p>
            <Link
              href="/auth"
              className="text-xs font-semibold text-[var(--eco-moss)]"
            >
              Go to sign in →
            </Link>
          </div>
        ) : me?.role !== "verifier" ? (
          <div className="rounded-[32px] border border-[var(--eco-sand)] bg-white/80 p-6 text-sm text-[var(--eco-forest)]/70">
            <p>This page is available to verifiers only.</p>
          </div>
        ) : (
          <div className="grid gap-8">
            <section className="grid gap-4">
              <div className="flex items-center justify-between">
                <h2 className="font-[var(--font-display)] text-2xl text-[var(--eco-forest)]">
                  Claims needing review
                </h2>
                <span className="text-xs text-[var(--eco-forest)]/60">
                  {claims.length} total
                </span>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {claims.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[var(--eco-sand)] p-5 text-xs text-[var(--eco-forest)]/70">
                    No handoffs are waiting for review.
                  </div>
                ) : (
                  claims.map((claim) => (
                    <div
                      key={claim._id}
                      className="rounded-2xl border border-[var(--eco-sand)] bg-white/80 p-5 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-base font-semibold text-[var(--eco-forest)]">
                            {claim.listing?.title ?? "Missing listing"}
                          </p>
                          <p className="text-xs text-[var(--eco-forest)]/60">
                            {claim.listing?.location ?? "No location"}
                          </p>
                        </div>
                        <span className="rounded-full bg-[var(--eco-mist)] px-3 py-1 text-xs text-[var(--eco-forest)]">
                          {claim.status}
                        </span>
                      </div>
                      <div className="mt-3 text-xs text-[var(--eco-forest)]/70">
                        <p>
                          Claimant:{" "}
                          {claim.claimant?.name ??
                            claim.claimant?.email ??
                            "Unknown"}
                        </p>
                        <p>
                          Owner:{" "}
                          {claim.owner?.name ?? claim.owner?.email ?? "Unknown"}
                        </p>
                      </div>
                      <div className="mt-3 rounded-2xl bg-[var(--eco-mist)]/70 p-3 text-[11px] text-[var(--eco-forest)]/70">
                        <p>
                          Owner confirmed:{" "}
                          {claim.ownerConfirmedAt ? "yes" : "no"}
                        </p>
                        <p>
                          Claimant confirmed:{" "}
                          {claim.claimantConfirmedAt ? "yes" : "no"}
                        </p>
                        <p>
                          Listing coordinates: {claim.listing?.latitude ?? "-"},{" "}
                          {claim.listing?.longitude ?? "-"}
                        </p>
                        {claim.reviewStatus === "verified" && claim.txHash ? (
                          <div className="mt-2 pt-2 border-t border-[var(--eco-forest)]/20">
                            <p className="font-semibold text-[var(--eco-moss)]">
                              ✓ Verified on-chain
                            </p>
                            <p className="text-[10px] mt-1 font-mono break-all">
                              {claim.txHash}
                            </p>
                            <a
                              href={`https://testnet.snowscan.xyz/tx/${claim.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-[var(--eco-moss)] hover:underline"
                            >
                              View on Fuji Explorer →
                            </a>
                          </div>
                        ) : null}
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2 text-xs">
                        <button
                          onClick={() =>
                            void review({
                              claimId: claim._id,
                              decision: "verified",
                            })
                          }
                          className="rounded-full border border-[var(--eco-forest)]/20 px-3 py-1 text-[var(--eco-forest)]"
                        >
                          Verify
                        </button>
                        <button
                          onClick={() =>
                            void review({
                              claimId: claim._id,
                              decision: "rejected",
                            })
                          }
                          className="rounded-full border border-[var(--eco-rust)]/50 px-3 py-1 text-[var(--eco-rust)]"
                        >
                          Reject
                        </button>
                        {claim.listing?.id ? (
                          <Link
                            href={`/listings/${claim.listing.id}`}
                            className="rounded-full border border-[var(--eco-forest)]/20 px-3 py-1 text-[var(--eco-forest)]"
                          >
                            Open listing
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="grid gap-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-[var(--font-display)] text-2xl text-[var(--eco-forest)]">
                    All listings
                  </h2>
                  <p className="mt-1 text-xs text-[var(--eco-forest)]/60">
                    A complete view of active community listings.
                  </p>
                </div>
                <span className="text-xs text-[var(--eco-forest)]/60">
                  {listings.length} total
                </span>
              </div>

              {listings.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[var(--eco-sand)] p-5 text-xs text-[var(--eco-forest)]/70">
                  No listings yet. Once users post donations, they will appear
                  here.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {listings.map((donation) => (
                    <DonationCard
                      key={donation._id}
                      donation={{
                        id: donation._id,
                        title: donation.title,
                        location: donation.location,
                        category: donation.category,
                        status: donation.status,
                        coordinator: donation.coordinator,
                        updatedAt: donation.updatedAt,
                        request: donation.request,
                      }}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
