import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

const GEOFENCE_RADIUS_METERS = 300;

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function haversineMeters(
  latitudeA: number,
  longitudeA: number,
  latitudeB: number,
  longitudeB: number,
) {
  const earthRadius = 6371000;
  const deltaLat = toRadians(latitudeB - latitudeA);
  const deltaLon = toRadians(longitudeB - longitudeA);
  const lat1 = toRadians(latitudeA);
  const lat2 = toRadians(latitudeB);
  const haversine =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;
  return 2 * earthRadius * Math.asin(Math.sqrt(haversine));
}

type ConfirmLocation = {
  latitude?: number;
  longitude?: number;
};

function evaluateGeofence(
  listing: { latitude?: number; longitude?: number },
  location: ConfirmLocation,
) {
  if (
    listing.latitude === undefined ||
    listing.longitude === undefined ||
    location.latitude === undefined ||
    location.longitude === undefined
  ) {
    return { inRange: false, distanceMeters: undefined };
  }
  const distanceMeters = haversineMeters(
    listing.latitude,
    listing.longitude,
    location.latitude,
    location.longitude,
  );
  return { inRange: distanceMeters <= GEOFENCE_RADIUS_METERS, distanceMeters };
}

async function notifyVerifiers(
  ctx: { db: any },
  payload: { title: string; body: string; link: string },
) {
  const verifiers = await ctx.db
    .query("users")
    .withIndex("by_role", (q: any) => q.eq("role", "verifier"))
    .collect();

  await Promise.all(
    verifiers.map((verifier: any) =>
      ctx.db.insert("notifications", {
        userId: verifier._id,
        title: payload.title,
        body: payload.body,
        link: payload.link,
        kind: "claim_needs_review",
        createdAt: Date.now(),
      }),
    ),
  );
}

export const listByListing = query({
  args: { listingId: v.id("donations") },
  handler: async (ctx, args) => {
    const claims = await ctx.db
      .query("claims")
      .withIndex("by_listing", (q) => q.eq("listingId", args.listingId))
      .order("desc")
      .collect();

    return await Promise.all(
      claims.map(async (claim) => {
        const claimant = await ctx.db.get(claim.claimantId);
        return {
          ...claim,
          claimant: claimant
            ? {
                id: claimant._id,
                name: claimant.name,
                email: claimant.email,
              }
            : null,
        };
      }),
    );
  },
});

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }
    return await ctx.db
      .query("claims")
      .withIndex("by_claimant", (q) => q.eq("claimantId", userId))
      .order("desc")
      .collect();
  },
});

export const listNeedsReview = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    const user = await ctx.db.get(userId);
    if (user?.role !== "verifier") {
      throw new Error("Not authorized");
    }

    const claims = await ctx.db
      .query("claims")
      .withIndex("by_needs_review", (q) => q.eq("needsReview", true))
      .order("desc")
      .collect();

    return await Promise.all(
      claims.map(async (claim) => {
        const claimant = await ctx.db.get(claim.claimantId);
        const listing = await ctx.db.get(claim.listingId);
        const owner = listing?.ownerId
          ? await ctx.db.get(listing.ownerId)
          : null;

        return {
          ...claim,
          claimant: claimant
            ? {
                id: claimant._id,
                name: claimant.name,
                email: claimant.email,
              }
            : null,
          listing: listing
            ? {
                id: listing._id,
                title: listing.title,
                location: listing.location,
                latitude: listing.latitude,
                longitude: listing.longitude,
              }
            : null,
          owner: owner
            ? {
                id: owner._id,
                name: owner.name,
                email: owner.email,
              }
            : null,
        };
      }),
    );
  },
});

export const create = mutation({
  args: { listingId: v.id("donations") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const listing = await ctx.db.get(args.listingId);
    if (!listing) {
      throw new Error("Listing not found");
    }

    const existing = await ctx.db
      .query("claims")
      .withIndex("by_listing_claimant", (q) =>
        q.eq("listingId", args.listingId).eq("claimantId", userId),
      )
      .first();

    if (existing && existing.status !== "cancelled") {
      return existing._id;
    }

    const claimId = await ctx.db.insert("claims", {
      listingId: args.listingId,
      claimantId: userId,
      status: "pending",
      needsReview: false,
      createdAt: Date.now(),
    });

    if (listing.ownerId) {
      await ctx.db.insert("notifications", {
        userId: listing.ownerId,
        title: "New claim received",
        body: `Someone requested your listing "${listing.title}".`,
        link: `/listings/${listing._id}`,
        kind: "claim_received",
        createdAt: Date.now(),
      });
    }

    return claimId;
  },
});

export const approve = mutation({
  args: { claimId: v.id("claims") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const claim = await ctx.db.get(args.claimId);
    if (!claim) {
      throw new Error("Claim not found");
    }

    const listing = await ctx.db.get(claim.listingId);
    if (!listing || listing.ownerId !== userId) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.claimId, { status: "approved" });
    await ctx.db.patch(listing._id, { status: "assigned" });

    const otherClaims = await ctx.db
      .query("claims")
      .withIndex("by_listing", (q) => q.eq("listingId", claim.listingId))
      .collect();

    await Promise.all(
      otherClaims.map(async (item) => {
        if (item._id === claim._id) {
          return;
        }
        if (item.status === "pending") {
          await ctx.db.patch(item._id, { status: "cancelled" });
          await ctx.db.insert("notifications", {
            userId: item.claimantId,
            title: "Claim not selected",
            body: `The owner chose another claimant for "${listing.title}".`,
            link: `/listings/${listing._id}`,
            kind: "claim_cancelled",
            createdAt: Date.now(),
          });
        }
      }),
    );

    await ctx.db.insert("notifications", {
      userId: claim.claimantId,
      title: "Claim approved",
      body: `Your claim was approved for "${listing.title}".`,
      link: `/listings/${listing._id}`,
      kind: "claim_approved",
      createdAt: Date.now(),
    });

    return claim._id;
  },
});

export const fulfill = mutation({
  args: { claimId: v.id("claims") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const claim = await ctx.db.get(args.claimId);
    if (!claim) {
      throw new Error("Claim not found");
    }

    const listing = await ctx.db.get(claim.listingId);
    if (!listing) {
      throw new Error("Listing not found");
    }

    if (listing.ownerId !== userId && claim.claimantId !== userId) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.claimId, { status: "fulfilled" });
    await ctx.db.patch(listing._id, { status: "scheduled" });

    await ctx.db.insert("notifications", {
      userId: claim.claimantId,
      title: "Claim fulfilled",
      body: `The listing "${listing.title}" was marked fulfilled.`,
      link: `/listings/${listing._id}`,
      kind: "claim_fulfilled",
      createdAt: Date.now(),
    });

    if (listing.ownerId) {
      await ctx.db.insert("notifications", {
        userId: listing.ownerId,
        title: "Claim fulfilled",
        body: `The claim for "${listing.title}" was marked fulfilled.`,
        link: `/listings/${listing._id}`,
        kind: "claim_fulfilled",
        createdAt: Date.now(),
      });
    }

    return claim._id;
  },
});

export const confirmOwner = mutation({
  args: {
    claimId: v.id("claims"),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const claim = await ctx.db.get(args.claimId);
    if (!claim) {
      throw new Error("Claim not found");
    }

    const listing = await ctx.db.get(claim.listingId);
    if (!listing || listing.ownerId !== userId) {
      throw new Error("Not authorized");
    }

    if (claim.status !== "approved") {
      throw new Error("Claim must be approved before confirmation");
    }

    const geofence = evaluateGeofence(listing, {
      latitude: args.latitude,
      longitude: args.longitude,
    });
    const needsReview = claim.needsReview || !geofence.inRange;

    await ctx.db.patch(args.claimId, {
      ownerConfirmedAt: claim.ownerConfirmedAt ?? Date.now(),
      ownerConfirmLocation:
        args.latitude !== undefined && args.longitude !== undefined
          ? { latitude: args.latitude, longitude: args.longitude }
          : claim.ownerConfirmLocation,
      needsReview,
    });

    await ctx.db.insert("notifications", {
      userId: claim.claimantId,
      title: "Owner confirmed handoff",
      body: `The owner confirmed the handoff for "${listing.title}".`,
      link: `/listings/${listing._id}`,
      kind: "claim_owner_confirmed",
      createdAt: Date.now(),
    });

    if (needsReview) {
      await notifyVerifiers(ctx, {
        title: "Claim needs review",
        body: `Handoff confirmation for "${listing.title}" is outside the geofence or missing GPS.`,
        link: `/listings/${listing._id}`,
      });
    }

    const updatedClaim = await ctx.db.get(args.claimId);
    if (updatedClaim?.ownerConfirmedAt && updatedClaim?.claimantConfirmedAt) {
      await ctx.db.patch(args.claimId, { status: "fulfilled" });
      await ctx.db.patch(listing._id, { status: "scheduled" });

      await ctx.db.insert("notifications", {
        userId: claim.claimantId,
        title: "Claim fulfilled",
        body: `Both parties confirmed the handoff for "${listing.title}".`,
        link: `/listings/${listing._id}`,
        kind: "claim_fulfilled",
        createdAt: Date.now(),
      });

      if (listing.ownerId) {
        await ctx.db.insert("notifications", {
          userId: listing.ownerId,
          title: "Claim fulfilled",
          body: `Both parties confirmed the handoff for "${listing.title}".`,
          link: `/listings/${listing._id}`,
          kind: "claim_fulfilled",
          createdAt: Date.now(),
        });
      }
    }

    return claim._id;
  },
});

export const confirmClaimant = mutation({
  args: {
    claimId: v.id("claims"),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const claim = await ctx.db.get(args.claimId);
    if (!claim) {
      throw new Error("Claim not found");
    }

    const listing = await ctx.db.get(claim.listingId);
    if (!listing || claim.claimantId !== userId) {
      throw new Error("Not authorized");
    }

    if (claim.status !== "approved") {
      throw new Error("Claim must be approved before confirmation");
    }

    const geofence = evaluateGeofence(listing, {
      latitude: args.latitude,
      longitude: args.longitude,
    });
    const needsReview = claim.needsReview || !geofence.inRange;

    await ctx.db.patch(args.claimId, {
      claimantConfirmedAt: claim.claimantConfirmedAt ?? Date.now(),
      claimantConfirmLocation:
        args.latitude !== undefined && args.longitude !== undefined
          ? { latitude: args.latitude, longitude: args.longitude }
          : claim.claimantConfirmLocation,
      needsReview,
    });

    if (listing.ownerId) {
      await ctx.db.insert("notifications", {
        userId: listing.ownerId,
        title: "Claimant confirmed handoff",
        body: `The claimant confirmed the handoff for "${listing.title}".`,
        link: `/listings/${listing._id}`,
        kind: "claim_claimant_confirmed",
        createdAt: Date.now(),
      });
    }

    if (needsReview) {
      await notifyVerifiers(ctx, {
        title: "Claim needs review",
        body: `Handoff confirmation for "${listing.title}" is outside the geofence or missing GPS.`,
        link: `/listings/${listing._id}`,
      });
    }

    const updatedClaim = await ctx.db.get(args.claimId);
    if (updatedClaim?.ownerConfirmedAt && updatedClaim?.claimantConfirmedAt) {
      await ctx.db.patch(args.claimId, { status: "fulfilled" });
      await ctx.db.patch(listing._id, { status: "scheduled" });

      await ctx.db.insert("notifications", {
        userId: claim.claimantId,
        title: "Claim fulfilled",
        body: `Both parties confirmed the handoff for "${listing.title}".`,
        link: `/listings/${listing._id}`,
        kind: "claim_fulfilled",
        createdAt: Date.now(),
      });

      if (listing.ownerId) {
        await ctx.db.insert("notifications", {
          userId: listing.ownerId,
          title: "Claim fulfilled",
          body: `Both parties confirmed the handoff for "${listing.title}".`,
          link: `/listings/${listing._id}`,
          kind: "claim_fulfilled",
          createdAt: Date.now(),
        });
      }
    }

    return claim._id;
  },
});

export const review = mutation({
  args: {
    claimId: v.id("claims"),
    decision: v.union(v.literal("verified"), v.literal("rejected")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const reviewer = await ctx.db.get(userId);
    if (reviewer?.role !== "verifier") {
      throw new Error("Not authorized");
    }

    const claim = await ctx.db.get(args.claimId);
    if (!claim) {
      throw new Error("Claim not found");
    }

    const listing = await ctx.db.get(claim.listingId);

    const updates: Record<string, unknown> = {
      needsReview: false,
      reviewStatus: args.decision,
      reviewedAt: Date.now(),
      reviewedBy: userId,
    };

    if (args.decision === "rejected") {
      updates.status = "cancelled";
    }

    await ctx.db.patch(args.claimId, updates);

    if (args.decision === "rejected" && listing) {
      await ctx.db.patch(listing._id, { status: "ready" });
    }

    const title = listing?.title ?? "this listing";
    const decisionCopy = args.decision === "verified" ? "verified" : "rejected";

    await ctx.db.insert("notifications", {
      userId: claim.claimantId,
      title: "Claim review completed",
      body: `A verifier ${decisionCopy} the handoff for "${title}".`,
      link: listing ? `/listings/${listing._id}` : undefined,
      kind: "claim_reviewed",
      createdAt: Date.now(),
    });

    if (listing?.ownerId) {
      await ctx.db.insert("notifications", {
        userId: listing.ownerId,
        title: "Claim review completed",
        body: `A verifier ${decisionCopy} the handoff for "${title}".`,
        link: `/listings/${listing._id}`,
        kind: "claim_reviewed",
        createdAt: Date.now(),
      });
    }

    return args.claimId;
  },
});

export const cancel = mutation({
  args: { claimId: v.id("claims") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const claim = await ctx.db.get(args.claimId);
    if (!claim) {
      throw new Error("Claim not found");
    }

    const listing = await ctx.db.get(claim.listingId);
    if (!listing) {
      throw new Error("Listing not found");
    }

    if (listing.ownerId !== userId && claim.claimantId !== userId) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.claimId, { status: "cancelled" });

    if (claim.status === "approved") {
      await ctx.db.patch(listing._id, { status: "ready" });
    }

    await ctx.db.insert("notifications", {
      userId: claim.claimantId,
      title: "Claim cancelled",
      body: `Your claim for "${listing.title}" was cancelled.`,
      link: `/listings/${listing._id}`,
      kind: "claim_cancelled",
      createdAt: Date.now(),
    });

    if (listing.ownerId) {
      await ctx.db.insert("notifications", {
        userId: listing.ownerId,
        title: "Claim cancelled",
        body: `A claim for "${listing.title}" was cancelled.`,
        link: `/listings/${listing._id}`,
        kind: "claim_cancelled",
        createdAt: Date.now(),
      });
    }

    return claim._id;
  },
});
