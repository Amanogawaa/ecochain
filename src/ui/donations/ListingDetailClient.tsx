"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useConvexAuth } from "@convex-dev/auth/react";
import { api } from "@/../convex/_generated/api";
import type { Donation, DonationStatus } from "@/domains/donations/Donation";
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

type DonationDetail = Donation & {
  _id: Id<"donations">;
  ownerId?: Id<"users">;
  requestId?: Id<"requests">;
};

export function ListingDetailClient({ id }: ListingDetailClientProps) {
  const donation = useQuery(api.donations.getById, id ? { id } : "skip") as
    | DonationDetail
    | null
    | undefined;
  const claims =
    useQuery(api.claims.listByListing, id ? { listingId: id } : "skip") ?? [];
  const { isAuthenticated } = useConvexAuth();
  const me = useQuery(api.users.me);
  const createClaim = useMutation(api.claims.create);
  const approveClaim = useMutation(api.claims.approve);
  const cancelClaim = useMutation(api.claims.cancel);
  const confirmOwner = useMutation(api.claims.confirmOwner);
  const confirmClaimant = useMutation(api.claims.confirmClaimant);
  const verifyOnChain = useMutation(api.claims.verifyOnChain);

  const [geoError, setGeoError] = useState<string | null>(null);

  const isOwner = Boolean(me && donation && donation.ownerId === me._id);
  const myClaim = useMemo(
    () => claims.find((claim) => claim.claimantId === me?._id),
    [claims, me],
  );

  const getLocation = () =>
    new Promise<{ latitude?: number; longitude?: number }>((resolve) => {
      if (!navigator.geolocation) {
        resolve({});
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) =>
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }),
        () => resolve({}),
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 },
      );
    });

  const handleConfirmOwner = async (claimId: Id<"claims">) => {
    setGeoError(null);
    const location = await getLocation();
    if (location.latitude === undefined) {
      setGeoError(
        "GPS not available. Confirmation will be flagged for review.",
      );
    }
    await confirmOwner({ claimId, ...location });
  };

  const handleConfirmClaimant = async (claimId: Id<"claims">) => {
    setGeoError(null);
    const location = await getLocation();
    if (location.latitude === undefined) {
      setGeoError(
        "GPS not available. Confirmation will be flagged for review.",
      );
    }
    await confirmClaimant({ claimId, ...location });
  };

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
          {donation.request?.requester ? (
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--eco-forest)]/60">
                Recipient
              </p>
              <p className="mt-2 text-sm text-[var(--eco-forest)]">
                {donation.request.requester.name ??
                  donation.request.requester.email ??
                  "the requester"}
              </p>
            </div>
          ) : null}
        </div>
        {/* <div className="rounded-2xl border border-[var(--eco-sand)] bg-[var(--eco-mist)] p-5 text-xs text-[var(--eco-forest)]/70"> */}
        {/* <p className="text-xs uppercase tracking-[0.2em] text-[var(--eco-forest)]/60">
            Activity
          </p>
          <p className="mt-3 text-base font-semibold text-[var(--eco-forest)]">
            {donation.updatedAt}
          </p>
          <p className="mt-2">
            Keep this detail view handy for your demo. This is where the
            verification button can later trigger the Avalanche transaction.
          </p> */}
        {me?.role === "verifier" ? (
          <button
            onClick={async () => {
              try {
                // pick a fulfilled claim for this listing (or the first claim)
                const target =
                  claims.find((c) => c.status === "fulfilled" && !c.txHash) ||
                  claims[0];
                if (!target) {
                  setGeoError("No claim available to verify on-chain.");
                  return;
                }
                await verifyOnChain({ claimId: target._id });
              } catch (e) {
                setGeoError("On-chain verification failed.");
              }
            }}
            className="mt-4 w-full rounded-full border border-[var(--eco-forest)]/20 bg-white/70 px-4 py-2 text-xs font-semibold max-h-10 text-[var(--eco-forest)] transition hover:translate-y-[-1px]"
          >
            Verify handoff
          </button>
        ) : (
          <div className="mt-4" />
        )}
        {/* </div> */}
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
        {/* <p className="text-sm text-[var(--eco-forest)]/70">
          Add item description, pickup windows, or a QR code here once you
          connect to your backend or on-chain verifier.
        </p> */}
        {donation.request ? (
          <p className="text-xs text-[var(--eco-forest)]/70">
            This donation is linked to the request "{donation.request.title}".
            The requester will receive the item.
          </p>
        ) : null}
        {geoError ? (
          <p className="text-xs text-[var(--eco-rust)]">{geoError}</p>
        ) : null}
        {!isAuthenticated ? (
          <div className="rounded-2xl border border-[var(--eco-sand)] bg-white/70 p-4 text-xs text-[var(--eco-forest)]/70">
            Sign in to claim this listing.
          </div>
        ) : isOwner ? (
          <div className="rounded-2xl border border-[var(--eco-sand)] bg-white/70 p-4 text-xs text-[var(--eco-forest)]/70">
            You are the owner of this listing.
          </div>
        ) : myClaim ? (
          <div className="rounded-2xl border border-[var(--eco-sand)] bg-white/70 p-4 text-xs text-[var(--eco-forest)]/70">
            Your claim status:{" "}
            <span className="font-semibold">{myClaim.status}</span>
            {myClaim.status === "pending" ? (
              <button
                onClick={() => void cancelClaim({ claimId: myClaim._id })}
                className="mt-3 rounded-full border border-[var(--eco-rust)]/50 px-3 py-1 text-xs text-[var(--eco-rust)]"
              >
                Cancel claim
              </button>
            ) : null}
            {myClaim.status === "approved" ? (
              <div className="mt-3 grid gap-2">
                <button
                  onClick={() => void handleConfirmClaimant(myClaim._id)}
                  className="rounded-full border border-[var(--eco-forest)]/20 px-3 py-1 text-xs text-[var(--eco-forest)]"
                >
                  Confirm received
                </button>
                <p className="text-[11px] text-[var(--eco-forest)]/60">
                  Your confirmation is paired with the owner to complete
                  handoff.
                </p>
              </div>
            ) : null}
          </div>
        ) : me?.role === "verifier" ? (
          <div className="rounded-2xl border border-[var(--eco-sand)] bg-white/70 p-4 text-xs text-[var(--eco-forest)]/70">
            Verifiers cannot claim listings. Use the dashboard to review and
            verify handoffs.
          </div>
        ) : (
          <button
            onClick={() => void createClaim({ listingId: donation._id })}
            className="rounded-full border border-[var(--eco-forest)]/20 px-4 py-2 text-xs font-semibold text-[var(--eco-forest)]"
          >
            Claim this listing
          </button>
        )}
        <Link
          href="/listings"
          className="text-xs font-semibold text-[var(--eco-moss)]"
        >
          Back to listings →
        </Link>
      </section>

      <section className="grid gap-3 rounded-[32px] border border-[var(--eco-sand)] bg-white/80 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="font-[var(--font-display)] text-xl text-[var(--eco-forest)]">
            Claims
          </h3>
          <span className="text-xs text-[var(--eco-forest)]/60">
            {claims.length} total
          </span>
        </div>
        <div className="grid gap-3">
          {claims.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--eco-sand)] p-4 text-xs text-[var(--eco-forest)]/70">
              No claims yet. Encourage neighbors to claim this listing.
            </div>
          ) : (
            claims.map((claim) => {
              const canApprove = isOwner && claim.status === "pending";
              const canConfirmOwner = isOwner && claim.status === "approved";
              const canCancel = isOwner && claim.status === "pending";
              const isConfirmedByOwner = Boolean(claim.ownerConfirmedAt);
              const isConfirmedByClaimant = Boolean(claim.claimantConfirmedAt);

              return (
                <div
                  key={claim._id}
                  className="rounded-2xl border border-[var(--eco-sand)] bg-white/70 p-4 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-[var(--eco-forest)]">
                        {claim.claimant?.name ??
                          claim.claimant?.email ??
                          "Anonymous"}
                      </p>
                      <p className="text-[var(--eco-forest)]/60">
                        Status: {claim.status}
                      </p>
                      <p className="mt-2 text-[11px] text-[var(--eco-forest)]/60">
                        Owner confirmed: {isConfirmedByOwner ? "yes" : "no"} ·
                        Claimant confirmed:{" "}
                        {isConfirmedByClaimant ? "yes" : "no"}
                      </p>
                      {claim.reviewStatus ? (
                        <p className="mt-2 text-[11px] text-[var(--eco-forest)]/60">
                          Review status: {claim.reviewStatus}
                        </p>
                      ) : null}
                      {claim.reviewStatus === "verified" && claim.txHash ? (
                        <div className="mt-2 pt-2 border-t border-[var(--eco-sand)]">
                          <p className="text-[11px] font-semibold text-[var(--eco-moss)]">
                            ✓ Verified on Avalanche Fuji (Simulated)
                          </p>
                          <p className="text-[10px] mt-1 font-mono break-all text-[var(--eco-forest)]/60">
                            {claim.txHash}
                          </p>
                          <a
                            href={`https://testnet.snowscan.xyz/tx/${claim.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-[var(--eco-moss)] hover:underline"
                          >
                            View proof →
                          </a>
                        </div>
                      ) : null}
                      {claim.needsReview ? (
                        <p className="mt-2 text-[11px] text-[var(--eco-rust)]">
                          Needs verifier review (GPS outside 300m or missing).
                        </p>
                      ) : null}
                    </div>
                    {claim.status === "approved" ? (
                      <span className="rounded-full bg-[var(--eco-mist)] px-3 py-1 text-[var(--eco-forest)]">
                        Approved
                      </span>
                    ) : null}
                  </div>
                  {isOwner ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {canApprove ? (
                        <button
                          onClick={() =>
                            void approveClaim({ claimId: claim._id })
                          }
                          className="rounded-full border border-[var(--eco-forest)]/20 px-3 py-1 text-[var(--eco-forest)]"
                        >
                          Approve
                        </button>
                      ) : null}
                      {canConfirmOwner && !isConfirmedByOwner ? (
                        <button
                          onClick={() => void handleConfirmOwner(claim._id)}
                          className="rounded-full border border-[var(--eco-forest)]/20 px-3 py-1 text-[var(--eco-forest)]"
                        >
                          Confirm handoff
                        </button>
                      ) : null}
                      {canCancel ? (
                        <button
                          onClick={() =>
                            void cancelClaim({ claimId: claim._id })
                          }
                          className="rounded-full border border-[var(--eco-rust)]/50 px-3 py-1 text-[var(--eco-rust)]"
                        >
                          Cancel
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
